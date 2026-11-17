import { Card, Pill, Text } from '@components';
import React from 'react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import styled from 'styled-components';

import { MarketplaceProduct } from '@app/enterpriseMarketplace/enterpriseMarketplace.types';
import { PageRoutes } from '@conf/Global';

const CardLink = styled(Link)`
    display: flex;
    height: 100%;
    border-radius: 12px;
    color: inherit;

    &:hover,
    &:focus {
        color: inherit;
    }

    &:focus-visible {
        outline: 2px solid ${(props) => props.theme.colors.borderBrandFocused};
        outline-offset: 2px;
    }

    & > * {
        flex: 1;
    }
`;

const Details = styled.dl`
    display: flex;
    flex-direction: column;
    gap: 4px;
    margin: 0;
    font-size: 12px;
`;

const DetailRow = styled.div`
    display: flex;
    gap: 8px;
    min-width: 0;

    dt {
        flex-shrink: 0;
        font-weight: normal;
        color: ${(props) => props.theme.colors.textTertiary};
    }

    dd {
        margin: 0;
        min-width: 0;
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
        color: ${(props) => props.theme.colors.textSecondary};
    }
`;

type Props = {
    product: MarketplaceProduct;
};

export default function DataProductCard({ product }: Props) {
    const { t } = useTranslation('enterpriseMarketplace');
    const ownerNames = product.owners.map((owner) => owner.name).join(', ');

    return (
        <CardLink
            to={`${PageRoutes.DATA_PRODUCT_ENTITY}/${encodeURIComponent(product.urn)}`}
            aria-label={t('card.open', { name: product.name })}
            data-testid={`enterprise-marketplace-product-${product.urn}`}
        >
            <Card
                title={product.name}
                subTitle={product.description || t('card.noDescription')}
                noOfSubtitleLines={2}
                isCardClickable={false}
                pill={
                    product.isDeprecated ? (
                        <Pill label={t('card.deprecated')} size="sm" color="red" clickable={false} />
                    ) : null
                }
            >
                <Details>
                    <DetailRow>
                        <dt>{t('card.domain')}</dt>
                        <dd>{product.domainName || t('card.noDomain')}</dd>
                    </DetailRow>
                    <DetailRow>
                        <dt>{t('card.owners')}</dt>
                        <dd title={ownerNames || undefined}>{ownerNames || t('card.noOwners')}</dd>
                    </DetailRow>
                </Details>
                {product.assetCount !== undefined && (
                    <Text size="sm">{t('card.assets', { count: product.assetCount })}</Text>
                )}
            </Card>
        </CardLink>
    );
}
