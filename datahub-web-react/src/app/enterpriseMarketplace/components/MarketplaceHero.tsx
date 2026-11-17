import { Heading, LoadedImage, SearchBar, Text } from '@components';
import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import styled, { useTheme } from 'styled-components';

import { useAppConfig } from '@app/useAppConfig';

const HeroContainer = styled.section`
    display: flex;
    flex-direction: column;
    gap: 16px;
    padding: 32px;
    border-radius: 12px;
    background-color: ${(props) => props.theme.colors.bgSurfaceBrand};
`;

const BrandRow = styled.div`
    display: flex;
    align-items: center;
    gap: 16px;
`;

const LogoWrapper = styled.div`
    display: flex;
    flex-shrink: 0;
    height: 48px;

    img {
        height: 48px;
        width: auto;
    }
`;

const TitleBlock = styled.div`
    display: flex;
    flex-direction: column;
    gap: 4px;
    min-width: 0;
`;

const SearchForm = styled.form`
    max-width: 640px;
    width: 100%;
`;

type Props = {
    onSearch: (query: string) => void;
};

export default function MarketplaceHero({ onSearch }: Props) {
    const { t } = useTranslation('enterpriseMarketplace');
    const theme = useTheme();
    const { config, loaded } = useAppConfig();
    const [query, setQuery] = useState('');

    const logoUrl = loaded ? config.visualConfig.logoUrl || theme.assets.logoUrl : undefined;

    const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        onSearch(query.trim());
    };

    return (
        <HeroContainer data-testid="enterprise-marketplace-hero">
            <BrandRow>
                {logoUrl && (
                    <LogoWrapper>
                        <LoadedImage src={logoUrl} alt={t('hero.logoAlt')} />
                    </LogoWrapper>
                )}
                <TitleBlock>
                    <Heading type="h1" size="2xl" weight="bold">
                        {t('hero.title')}
                    </Heading>
                    <Text size="md">{t('hero.tagline')}</Text>
                </TitleBlock>
            </BrandRow>
            <SearchForm role="search" onSubmit={handleSubmit}>
                <SearchBar
                    value={query}
                    onChange={(value) => setQuery(value)}
                    placeholder={t('hero.searchPlaceholder')}
                    aria-label={t('hero.searchLabel')}
                    data-testid="enterprise-marketplace-search"
                />
            </SearchForm>
        </HeroContainer>
    );
}
