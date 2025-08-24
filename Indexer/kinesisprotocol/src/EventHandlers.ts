import {
  KinesisProtocol,
  KinesisProtocol_UserDeposited,
  KinesisProtocol_UserWithdrawn,
  KinesisProtocol_WithdrawBridgeAndSupplied,
} from "generated";


KinesisProtocol.UserDeposited.handler(async ({ event, context }) => {
  const entity: KinesisProtocol_UserDeposited = {
    id: `${event.chainId}_${event.block.number}_${event.logIndex}`,
    user: event.params.user,
    assets: event.params.assets,
    shares: event.params.shares,
  };

  context.KinesisProtocol_UserDeposited.set(entity);
});

KinesisProtocol.UserWithdrawn.handler(async ({ event, context }) => {
  const entity: KinesisProtocol_UserWithdrawn = {
    id: `${event.chainId}_${event.block.number}_${event.logIndex}`,
    user: event.params.user,
    assets: event.params.assets,
    shares: event.params.shares,
  };

  context.KinesisProtocol_UserWithdrawn.set(entity);
});

KinesisProtocol.WithdrawBridgeAndSupplied.handler(async ({ event, context }) => {
  const entity: KinesisProtocol_WithdrawBridgeAndSupplied = {
    id: `${event.chainId}_${event.block.number}_${event.logIndex}`,
    receiver: event.params.Receiver,
    gasFeesAmount: event.params.GasFeesAmount,
    destinationChainSelector: event.params.DestinationChainSelector,
  };

  context.KinesisProtocol_WithdrawBridgeAndSupplied.set(entity);
  
});