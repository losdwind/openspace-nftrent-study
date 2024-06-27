import type { NextApiRequest, NextApiResponse } from "next";
import { verifyTypedData } from "@wagmi/core";
import { wagmiConfig, PROTOCOL_CONFIG, eip721Types, config } from "@/config";
import { NFTInfo, RentoutOrderEntry, RentoutOrderMsg } from "@/types";
import { saveOrder } from "@/pages/api/db";
import { Address } from "viem";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === "POST") {
    try {
      const { order, signature, chainId, nft } = req.body;
      if (!order || !signature) {
        return res.status(200).json({ error: "Invalid request" });
      } else {
        const orderInfo = order as RentoutOrderMsg;
        console.log("orderInfo:", orderInfo);
        const ok = await verifyingOrder(chainId, orderInfo, signature);
        console.log("ok", ok);
        if (ok) {
          // 验证签名通过后，将订单存储到数据库
          await saveOrder(chainId, orderInfo, nft as NFTInfo, signature);
          return res.status(200).json({ success: true });
        } else {
          // 如果失败，则提示签名错误
          return res.status(200).json({ error: "Invalid signature" });
        }
      }
    } catch (error: any) {
      console.log("===============================", error);
      return res.status(200).json({ error: error.message || error });
    }
  } else {
    // Handle any other HTTP method
    return res.status(404).end();
  }
}

// 校验出租订单签名 https://wagmi.sh/core/api/actions/verifyTypedData#message
async function verifyingOrder(chainId: any, order: RentoutOrderMsg, signature: any) {
  // TODO: 验证订单签名
  const valid = await verifyTypedData(config, {
    domain: PROTOCOL_CONFIG[chainId].domain,
    types: eip721Types,
    primaryType: "RentOutOrder",
    message: {
      maker: order.maker as Address, // 租户地址
      nft_ca: order.nft_ca as Address, // NFT合约地址
      token_id: order.token_id, // NFT tokenId
      daily_rent: order.daily_rent, // 每日租金
      max_rental_duration: order.max_rental_duration, // 最大租赁时长
      min_collateral: order.min_collateral, // 最小抵押
      list_endtime: order.list_endtime, // 挂单结束时间
    },
    address: order.maker as Address,
    signature: signature,
  });
  console.log("verify", valid);

  return valid;
}
