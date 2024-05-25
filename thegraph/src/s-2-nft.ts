import {
  Approval as ApprovalEvent,
  ApprovalForAll as ApprovalForAllEvent,
  Transfer as TransferEvent,S2NFT
} from "../generated/templates/S2NFT/S2NFT"

import { Approval, ApprovalForAll, Transfer, TokenInfo } from "../generated/schema"


export function handleApproval(event: ApprovalEvent): void {
  let entity = new Approval(
    event.transaction.hash.concatI32(event.logIndex.toI32()),
  )
  entity.owner = event.params.owner
  entity.approved = event.params.approved
  entity.tokenId = event.params.tokenId

  entity.blockNumber = event.block.number
  entity.blockTimestamp = event.block.timestamp
  entity.transactionHash = event.transaction.hash

  entity.save()
}

export function handleApprovalForAll(event: ApprovalForAllEvent): void {
  let entity = new ApprovalForAll(
    event.transaction.hash.concatI32(event.logIndex.toI32()),
  )
  entity.owner = event.params.owner
  entity.operator = event.params.operator
  entity.approved = event.params.approved

  entity.blockNumber = event.block.number
  entity.blockTimestamp = event.block.timestamp
  entity.transactionHash = event.transaction.hash

  entity.save()
}

export function handleTransfer(event: TransferEvent): void {
  let entity = new Transfer(
    event.transaction.hash.concatI32(event.logIndex.toI32()),
  )
  entity.from = event.params.from
  entity.to = event.params.to
  entity.tokenId = event.params.tokenId

  entity.blockNumber = event.block.number
  entity.blockTimestamp = event.block.timestamp
  entity.transactionHash = event.transaction.hash

  entity.save()

  // trigger tokeninfo save
  tokenInfo(event)

}

export function tokenInfo(event: TransferEvent): void {
  let contract = S2NFT.bind(event.address)
  let tokenId = event.params.tokenId
  let id = event.address.toHexString() + '-' + tokenId.toHexString()  

  // check if the nft was owned by other address
  let tokenInfo = TokenInfo.load(id)
  if(!tokenInfo){
    tokenInfo = new TokenInfo(id)
    // prepare new data
    let nftName = contract.name()
    let tokenURI = contract.tokenURI(tokenId)
    tokenInfo.ca = event.address
    tokenInfo.tokenId = tokenId
    tokenInfo.tokenURL = tokenURI
    tokenInfo.name = nftName
  }
  // prepare new or replace old data
  tokenInfo.owner = event.params.to
  tokenInfo.blockNumber = event.block.number
  tokenInfo.blockTimestamp = event.block.timestamp
  tokenInfo.transactionHash = event.transaction.hash
  tokenInfo.save()
}