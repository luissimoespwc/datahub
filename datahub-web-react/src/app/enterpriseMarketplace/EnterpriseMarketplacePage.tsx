import React from 'react';
import { useHistory } from 'react-router-dom';
import styled from 'styled-components';

import FeaturedDataProducts from '@app/enterpriseMarketplace/components/FeaturedDataProducts';
import MarketplaceHero from '@app/enterpriseMarketplace/components/MarketplaceHero';
import useEnterpriseMarketplaceProducts from '@app/enterpriseMarketplace/hooks/useEnterpriseMarketplaceProducts';
import { ENTITY_SUB_TYPE_FILTER_NAME } from '@app/searchV2/utils/constants';
import { navigateToSearchUrl } from '@app/searchV2/utils/navigateToSearchUrl';

import { EntityType } from '@types';

const PageContainer = styled.main`
    display: flex;
    flex-direction: column;
    flex: 1;
    gap: 24px;
    min-height: 0;
    overflow-y: auto;
    padding: 24px;
    border-radius: ${(props) => props.theme.styles['border-radius-navbar-redesign']};
    background-color: ${(props) => props.theme.colors.bg};
    box-shadow: ${(props) => props.theme.colors.shadowSm};

    @media (max-width: 768px) {
        padding: 16px;
        gap: 16px;
    }
`;

const DATA_PRODUCT_FILTERS = [{ field: ENTITY_SUB_TYPE_FILTER_NAME, values: [EntityType.DataProduct] }];

export default function EnterpriseMarketplacePage() {
    const history = useHistory();
    const { products, total, loading, error, isForbidden, refetch } = useEnterpriseMarketplaceProducts();

    const searchDataProducts = (query: string) => {
        navigateToSearchUrl({ query, filters: DATA_PRODUCT_FILTERS, history });
    };

    return (
        <PageContainer data-testid="enterprise-marketplace-page">
            <MarketplaceHero onSearch={searchDataProducts} />
            <FeaturedDataProducts
                products={products}
                total={total}
                loading={loading}
                hasError={!!error}
                isForbidden={isForbidden}
                onRetry={() => refetch()}
                onBrowseAll={() => searchDataProducts('')}
            />
        </PageContainer>
    );
}
