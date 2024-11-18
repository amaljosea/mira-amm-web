import request, { gql } from "graphql-request";
import { SQDIndexerUrl } from "../utils/constants";
import { useQuery } from "@tanstack/react-query";
import { CoinDataWithPrice } from "../utils/coinsConfig";

export const useAssetList = (): { assets: CoinDataWithPrice[], isLoading: boolean } => {
  const { data, isLoading } = useQuery<any>({
    queryKey: ['assets'],
    queryFn: async () => {
      const query = gql`
        query MyQuery {
          assets(where: {numPools_gt:0}) {
            image
            name
            symbol
            id
            decimals
            numPools
            l1Address
            price
          }
        }`;

      const results = await request<{ assets: any }>({
        url: SQDIndexerUrl,
        document: query,
      });

      const assets = results.assets.map((asset: any): CoinDataWithPrice => ({
        assetId: asset.id,
        name: asset.name,
        symbol: asset.symbol,
        decimals: asset.decimals,
        icon: asset.image,
        l1Address: asset.l1Address,
        price: asset.price,
      }));

      return assets;
    },
  });

  return { assets: data, isLoading };
};