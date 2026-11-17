export type MarketplaceProductOwner = {
    urn: string;
    name: string;
};

export type MarketplaceProduct = {
    urn: string;
    name: string;
    description?: string;
    domainName?: string;
    owners: MarketplaceProductOwner[];
    assetCount?: number;
    isDeprecated: boolean;
};
