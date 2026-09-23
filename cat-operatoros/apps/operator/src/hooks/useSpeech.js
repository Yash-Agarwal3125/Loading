/**
 * VOICE — build this LAST, on a branch, after the fallback video is
 * recorded. See docs/IMPLEMENTATION_GUIDE.md, Block 15.
 *
 *   useSpeech() -> { supported, listening, transcript, start, stop, speak }
 *
 * DEFENSIVE RULES
 * - Hold-to-talk only. Never always-listening: ambient chatter in a judging
 *   room will fire false triggers.
 * - Render the live transcript on screen while listening. The audience
 *   watching words appear is most of the impression.
 * - Intent match locally via services/assistant.js. No network.
 * - Speak the answer back AND print it.
 * - Tap-chips stay visible underneath at all times. If recognition misses,
 *   the operator taps and nothing looks broken.
 * - Provide a demo-mode switch that injects a scripted transcript, for when
 *   the room is too loud.
 *
 * SUPPORT: webkitSpeechRecognition in Chrome and Edge. Firefox has none.
 * Safari is prefixed and unreliable. Requires HTTPS when deployed; localhost
 * is exempt. Test on the actual demo laptop at actual room volume.
 */
// TODO(Block 15)
