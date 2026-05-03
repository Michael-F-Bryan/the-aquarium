export class InvalidRunSnapshotError extends Error {
  readonly messages: readonly string[];

  constructor(messages: readonly string[]) {
    super(messages.join("; "));
    this.name = "InvalidRunSnapshotError";
    this.messages = messages;
  }
}
