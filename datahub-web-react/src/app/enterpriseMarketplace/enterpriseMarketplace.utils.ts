import { ApolloError } from '@apollo/client';

import { MarketplaceProduct, MarketplaceProductOwner } from '@app/enterpriseMarketplace/enterpriseMarketplace.types';
import { ErrorCodes } from '@app/sharedV2/constants';

import { GetRootDataProductsBrowseQuery } from '@graphql/marketplaceBrowse.generated';

export type RootDataProduct = NonNullable<
    GetRootDataProductsBrowseQuery['getRootDataProducts']
>['dataProducts'][number];

type OwnerEntity = NonNullable<NonNullable<RootDataProduct['ownership']>['owners']>[number]['owner'];

function getOwnerName(owner: OwnerEntity): string {
    if ('username' in owner) {
        return (
            owner.editableProperties?.displayName ||
            owner.properties?.displayName ||
            owner.properties?.fullName ||
            owner.info?.displayName ||
            owner.username
        );
    }
    return owner.properties?.displayName || owner.info?.displayName || owner.name || owner.urn;
}

function mapOwners(dataProduct: RootDataProduct): MarketplaceProductOwner[] {
    const seen = new Set<string>();
    const owners: MarketplaceProductOwner[] = [];
    (dataProduct.ownership?.owners ?? []).forEach(({ owner }) => {
        if (seen.has(owner.urn)) return;
        seen.add(owner.urn);
        owners.push({ urn: owner.urn, name: getOwnerName(owner) });
    });
    return owners;
}

export function mapDataProductToMarketplaceProduct(dataProduct: RootDataProduct): MarketplaceProduct {
    const { properties } = dataProduct;
    return {
        urn: dataProduct.urn,
        name: properties?.name || dataProduct.urn,
        description: properties?.description || undefined,
        domainName: dataProduct.domain?.domain?.properties?.name || undefined,
        owners: mapOwners(dataProduct),
        assetCount: properties?.numAssets ?? undefined,
        isDeprecated: !!dataProduct.deprecation?.deprecated,
    };
}

export function isForbiddenError(error?: ApolloError): boolean {
    return !!error?.graphQLErrors?.some((graphQLError) => graphQLError.extensions?.code === ErrorCodes.Forbidden);
}
