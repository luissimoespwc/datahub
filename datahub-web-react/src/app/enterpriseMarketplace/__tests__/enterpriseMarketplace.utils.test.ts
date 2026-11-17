import { ApolloError } from '@apollo/client';
import { GraphQLError } from 'graphql';

import {
    RootDataProduct,
    isForbiddenError,
    mapDataProductToMarketplaceProduct,
} from '@app/enterpriseMarketplace/enterpriseMarketplace.utils';

import { EntityType } from '@types';

const URN = 'urn:li:dataProduct:orders';

function buildDataProduct(overrides: Record<string, unknown> = {}): RootDataProduct {
    return {
        urn: URN,
        type: EntityType.DataProduct,
        properties: null,
        domain: null,
        applications: null,
        childDataProducts: null,
        ownership: null,
        tags: null,
        deprecation: null,
        ...overrides,
    } as unknown as RootDataProduct;
}

describe('mapDataProductToMarketplaceProduct', () => {
    it('maps names, domain, owners, asset count and deprecation', () => {
        const product = mapDataProductToMarketplaceProduct(
            buildDataProduct({
                properties: { name: 'Orders', description: 'All orders', numAssets: 4, createdOn: null },
                domain: { domain: { urn: 'urn:li:domain:sales', properties: { name: 'Sales' } } },
                ownership: {
                    owners: [
                        {
                            owner: {
                                urn: 'urn:li:corpuser:alice',
                                type: EntityType.CorpUser,
                                username: 'alice',
                                editableProperties: { displayName: 'Alice Smith' },
                            },
                        },
                        {
                            owner: {
                                urn: 'urn:li:corpGroup:analytics',
                                type: EntityType.CorpGroup,
                                name: 'analytics',
                                properties: { displayName: 'Analytics Team' },
                            },
                        },
                    ],
                },
                deprecation: { deprecated: true },
            }),
        );

        expect(product).toEqual({
            urn: URN,
            name: 'Orders',
            description: 'All orders',
            domainName: 'Sales',
            owners: [
                { urn: 'urn:li:corpuser:alice', name: 'Alice Smith' },
                { urn: 'urn:li:corpGroup:analytics', name: 'Analytics Team' },
            ],
            assetCount: 4,
            isDeprecated: true,
        });
    });

    it('falls back gracefully when metadata is missing', () => {
        const product = mapDataProductToMarketplaceProduct(
            buildDataProduct({
                ownership: {
                    owners: [
                        { owner: { urn: 'urn:li:corpuser:bob', type: EntityType.CorpUser, username: 'bob' } },
                        { owner: { urn: 'urn:li:corpuser:bob', type: EntityType.CorpUser, username: 'bob' } },
                    ],
                },
            }),
        );

        expect(product).toEqual({
            urn: URN,
            name: URN,
            description: undefined,
            domainName: undefined,
            owners: [{ urn: 'urn:li:corpuser:bob', name: 'bob' }],
            assetCount: undefined,
            isDeprecated: false,
        });
    });
});

describe('isForbiddenError', () => {
    it('detects a 403 GraphQL error', () => {
        const error = new ApolloError({
            graphQLErrors: [
                new GraphQLError('Unauthorized', undefined, undefined, undefined, undefined, undefined, {
                    code: 403,
                }),
            ],
        });
        expect(isForbiddenError(error)).toBe(true);
    });

    it('does not treat other failures as forbidden', () => {
        expect(isForbiddenError(new ApolloError({ networkError: new Error('offline') }))).toBe(false);
        expect(isForbiddenError(undefined)).toBe(false);
    });
});
