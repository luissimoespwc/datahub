import { Button, EmptyState, Heading, Loader, Text } from '@components';
import { LockSimple } from '@phosphor-icons/react/dist/csr/LockSimple';
import { Storefront } from '@phosphor-icons/react/dist/csr/Storefront';
import { WarningCircle } from '@phosphor-icons/react/dist/csr/WarningCircle';
import React from 'react';
import { useTranslation } from 'react-i18next';
import styled from 'styled-components';

import DataProductCard from '@app/enterpriseMarketplace/components/DataProductCard';
import { MarketplaceProduct } from '@app/enterpriseMarketplace/enterpriseMarketplace.types';

const SECTION_TITLE_ID = 'enterprise-marketplace-products-title';

const Section = styled.section`
    display: flex;
    flex-direction: column;
    gap: 16px;
`;

const SectionHeader = styled.div`
    display: flex;
    align-items: flex-end;
    justify-content: space-between;
    flex-wrap: wrap;
    gap: 8px;
`;

const HeaderText = styled.div`
    display: flex;
    flex-direction: column;
    gap: 2px;
`;

const ProductGrid = styled.ul`
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
    gap: 16px;
    margin: 0;
    padding: 0;
    list-style: none;
`;

const StateContainer = styled.div`
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 48px 16px;
`;

const PartialWarning = styled.div`
    padding: 8px 12px;
    border-radius: 8px;
    background-color: ${(props) => props.theme.colors.bgSurfaceWarning};
    color: ${(props) => props.theme.colors.textOnSurfaceWarning};
`;

type Props = {
    products: MarketplaceProduct[];
    total: number;
    loading: boolean;
    hasError: boolean;
    isForbidden: boolean;
    onRetry: () => void;
    onBrowseAll: () => void;
};

export default function FeaturedDataProducts({
    products,
    total,
    loading,
    hasError,
    isForbidden,
    onRetry,
    onBrowseAll,
}: Props) {
    const { t } = useTranslation('enterpriseMarketplace');
    const hasProducts = products.length > 0;

    let body: React.ReactNode;
    if (loading && !hasProducts) {
        body = (
            <StateContainer role="status" aria-label={t('products.loading')}>
                <Loader size="lg" />
            </StateContainer>
        );
    } else if (isForbidden && !hasProducts) {
        body = (
            <StateContainer>
                <EmptyState
                    icon={LockSimple}
                    title={t('products.forbiddenTitle')}
                    description={t('products.forbiddenDescription')}
                />
            </StateContainer>
        );
    } else if (hasError && !hasProducts) {
        body = (
            <StateContainer role="alert">
                <EmptyState
                    icon={WarningCircle}
                    title={t('products.errorTitle')}
                    description={t('products.errorDescription')}
                    action={{
                        label: t('products.retry'),
                        onClick: onRetry,
                        dataTestId: 'enterprise-marketplace-retry',
                    }}
                />
            </StateContainer>
        );
    } else if (!hasProducts) {
        body = (
            <StateContainer>
                <EmptyState
                    icon={Storefront}
                    title={t('products.emptyTitle')}
                    description={t('products.emptyDescription')}
                />
            </StateContainer>
        );
    } else {
        body = (
            <>
                {hasError && (
                    <PartialWarning role="status" data-testid="enterprise-marketplace-partial-warning">
                        <Text size="sm">{t('products.partialWarning')}</Text>
                    </PartialWarning>
                )}
                <ProductGrid>
                    {products.map((product) => (
                        <li key={product.urn}>
                            <DataProductCard product={product} />
                        </li>
                    ))}
                </ProductGrid>
            </>
        );
    }

    return (
        <Section aria-labelledby={SECTION_TITLE_ID} data-testid="enterprise-marketplace-products">
            <SectionHeader>
                <HeaderText>
                    <Heading type="h2" size="lg" weight="bold" id={SECTION_TITLE_ID}>
                        {t('products.title')}
                    </Heading>
                    {hasProducts && <Text size="sm">{t('products.subtitle', { count: total })}</Text>}
                </HeaderText>
                {hasProducts && (
                    <Button variant="text" onClick={onBrowseAll} data-testid="enterprise-marketplace-browse-all">
                        {t('products.browseAll')}
                    </Button>
                )}
            </SectionHeader>
            {body}
        </Section>
    );
}
