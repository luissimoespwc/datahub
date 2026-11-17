import { useMemo } from 'react';

import {
    isForbiddenError,
    mapDataProductToMarketplaceProduct,
} from '@app/enterpriseMarketplace/enterpriseMarketplace.utils';

import { useGetRootDataProductsBrowseQuery } from '@graphql/marketplaceBrowse.generated';

const DEFAULT_PRODUCT_COUNT = 12;

export default function useEnterpriseMarketplaceProducts(count: number = DEFAULT_PRODUCT_COUNT) {
    const { data, loading, error, refetch } = useGetRootDataProductsBrowseQuery({
        variables: { input: { start: 0, count } },
        // Keep whatever products resolved when some fields fail, so the page can show partial data.
        errorPolicy: 'all',
    });

    const result = data?.getRootDataProducts;
    const products = useMemo(
        () => (result?.dataProducts ?? []).map(mapDataProductToMarketplaceProduct),
        [result?.dataProducts],
    );

    return {
        products,
        total: result?.total ?? 0,
        loading,
        error,
        isForbidden: isForbiddenError(error),
        refetch,
    };
}
