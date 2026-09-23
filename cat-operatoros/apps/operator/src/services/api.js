/**
 * API client. Every call goes through the outbox for mutations — nothing
 * writes directly to the network, because the network is the exception.
 *
 * Reads may hit the network with a cache fallback, and the UI must show when
 * it is displaying cached data and how old it is.
 */
// TODO
