import { MockedProvider, MockedResponse } from '@apollo/client/testing';
import { fireEvent, render, screen } from '@testing-library/react';
import { GraphQLError } from 'graphql';
import i18n from 'i18next';
import React from 'react';
import { Route } from 'react-router-dom';

import EnterpriseMarketplacePage from '@app/enterpriseMarketplace/EnterpriseMarketplacePage';
import enEnterpriseMarketplace from '@src/i18n/locales/en/enterpriseMarketplace.json';
import TestPageContainer from '@utils/test-utils/TestPageContainer';

import { GetRootDataProductsBrowseDocument } from '@graphql/marketplaceBrowse.generated';
import { EntityType } from '@types';

const PRODUCT_URN = 'urn:li:dataProduct:orders';

const QUERY = {
    query: GetRootDataProductsBrowseDocument,
    variables: { input: { start: 0, count: 12 } },
};

const ORDERS_PRODUCT = {
    urn: PRODUCT_URN,
    type: EntityType.DataProduct,
    properties: { name: 'Orders', description: 'Every customer order', numAssets: 3, createdOn: null },
    domain: null,
    applications: null,
    childDataProducts: null,
    ownership: null,
    tags: null,
    deprecation: null,
};

function resultWithProducts(dataProducts: (typeof ORDERS_PRODUCT)[]) {
    return {
        getRootDataProducts: { total: dataProducts.length, start: 0, count: dataProducts.length, dataProducts },
    };
}

function renderPage(mocks: MockedResponse[]) {
    return render(
        <MockedProvider mocks={mocks} addTypename={false}>
            <TestPageContainer initialEntries={['/enterprise-marketplace']}>
                <EnterpriseMarketplacePage />
                <Route
                    path="*"
                    render={({ location }) => (
                        <div data-testid="current-location">{`${location.pathname}${location.search}`}</div>
                    )}
                />
            </TestPageContainer>
        </MockedProvider>,
    );
}

describe('EnterpriseMarketplacePage', () => {
    beforeAll(() => {
        i18n.addResourceBundle('en', 'enterpriseMarketplace', enEnterpriseMarketplace, true, true);
    });

    it('shows a loading state, then data product cards that link to the product page', async () => {
        renderPage([{ request: QUERY, result: { data: resultWithProducts([ORDERS_PRODUCT]) } }]);

        expect(screen.getByRole('status', { name: 'Loading data products' })).toBeInTheDocument();

        const link = await screen.findByRole('link', { name: 'Open data product Orders' });
        expect(link).toHaveAttribute('href', `/dataProduct/${encodeURIComponent(PRODUCT_URN)}`);
        expect(screen.getByText('Every customer order')).toBeInTheDocument();
        expect(screen.getByText('No domain')).toBeInTheDocument();
        expect(screen.getByText('3 assets')).toBeInTheDocument();
    });

    it('shows an empty state when no data products exist', async () => {
        renderPage([{ request: QUERY, result: { data: resultWithProducts([]) } }]);

        expect(await screen.findByText('No data products yet')).toBeInTheDocument();
    });

    it('shows a retryable error state when the request fails', async () => {
        renderPage([{ request: QUERY, error: new Error('Network down') }]);

        expect(await screen.findByText('Data products could not be loaded')).toBeInTheDocument();
        expect(screen.getByTestId('enterprise-marketplace-retry')).toBeInTheDocument();
    });

    it('shows an access message instead of an empty list when the user is forbidden', async () => {
        renderPage([
            {
                request: QUERY,
                result: {
                    errors: [
                        new GraphQLError('Unauthorized', undefined, undefined, undefined, undefined, undefined, {
                            code: 403,
                        }),
                    ],
                },
            },
        ]);

        expect(await screen.findByText('You do not have access to data products')).toBeInTheDocument();
        expect(screen.queryByText('No data products yet')).not.toBeInTheDocument();
    });

    it('keeps resolved products visible and flags partial data', async () => {
        renderPage([
            {
                request: QUERY,
                result: { data: resultWithProducts([ORDERS_PRODUCT]), errors: [new GraphQLError('Partial failure')] },
            },
        ]);

        expect(await screen.findByRole('link', { name: 'Open data product Orders' })).toBeInTheDocument();
        expect(screen.getByTestId('enterprise-marketplace-partial-warning')).toBeInTheDocument();
    });

    it('searches data products through the existing search page', async () => {
        renderPage([{ request: QUERY, result: { data: resultWithProducts([ORDERS_PRODUCT]) } }]);

        fireEvent.change(screen.getByLabelText('Search data products'), { target: { value: ' orders ' } });
        fireEvent.submit(screen.getByRole('search'));

        const location = screen.getByTestId('current-location').textContent ?? '';
        expect(location.startsWith('/search?')).toBe(true);
        expect(location).toContain('query=orders');
        expect(location).toContain(EntityType.DataProduct);
    });
});
