import {useQuery} from "@tanstack/react-query";
import { B256Address, Contract, Provider } from "fuels";
import src20Abi from "@/src/abis/src20-abi.json";
import { useProvider } from "@fuels/react";
import { useAssetMinterContract } from "./useAssetMinterContract";
import useMiraDex from "./useMiraDex/useMiraDex";
import { NetworkUrl } from "../utils/constants";

interface AssetMetadata {
  name?: string;
  symbol?: string;
  decimals?: number;
}

const providerPromise = Provider.create(NetworkUrl);

const useAssetMetadata = (assetId: B256Address | null): AssetMetadata => {
  const { contractId } = useAssetMinterContract(assetId);

  const { data, isLoading } = useQuery({
    queryKey: ['assetMetadata', contractId, assetId],
    queryFn: async () => {
      const provider = await providerPromise;
      const src20Contract = new Contract(contractId!, src20Abi, provider);

      const result = await src20Contract.multiCall([
        src20Contract.functions.name({ bits: assetId }),
        src20Contract.functions.symbol({ bits: assetId }),
        src20Contract.functions.decimals({ bits: assetId }),
      ])
        .addContracts([
          // The current bridge implementation
          new Contract('0x0ceafc5ef55c66912e855917782a3804dc489fb9e27edfd3621ea47d2a281156', src20Abi, provider!),
        ])
        .get();

      return {
        name: result.value[0],
        symbol: result.value[1],
        decimals: result.value[2],
      };
    },
    enabled: !!assetId && !!contractId,
    staleTime: Infinity,
  });

  return data || { name: undefined, symbol: undefined, decimals: undefined };
};

export default useAssetMetadata;