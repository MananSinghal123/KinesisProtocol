import assert from "assert";
import { 
  TestHelpers,
  KinesisProtocol_UserDeposited
} from "generated";
const { MockDb, KinesisProtocol } = TestHelpers;

describe("KinesisProtocol contract UserDeposited event tests", () => {
  // Create mock db
  const mockDb = MockDb.createMockDb();

  // Creating mock for KinesisProtocol contract UserDeposited event
  const event = KinesisProtocol.UserDeposited.createMockEvent({/* It mocks event fields with default values. You can overwrite them if you need */});

  it("KinesisProtocol_UserDeposited is created correctly", async () => {
    // Processing the event
    const mockDbUpdated = await KinesisProtocol.UserDeposited.processEvent({
      event,
      mockDb,
    });

    // Getting the actual entity from the mock database
    let actualKinesisProtocolUserDeposited = mockDbUpdated.entities.KinesisProtocol_UserDeposited.get(
      `${event.chainId}_${event.block.number}_${event.logIndex}`
    );

    // Creating the expected entity
    const expectedKinesisProtocolUserDeposited: KinesisProtocol_UserDeposited = {
      id: `${event.chainId}_${event.block.number}_${event.logIndex}`,
      user: event.params.user,
      assets: event.params.assets,
      shares: event.params.shares,
    };
    // Asserting that the entity in the mock database is the same as the expected entity
    assert.deepEqual(actualKinesisProtocolUserDeposited, expectedKinesisProtocolUserDeposited, "Actual KinesisProtocolUserDeposited should be the same as the expectedKinesisProtocolUserDeposited");
  });
});
