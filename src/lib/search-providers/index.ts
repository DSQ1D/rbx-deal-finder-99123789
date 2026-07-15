import type { SearchProvider } from "./types";
import { funpay } from "./funpay";
import { playerok } from "./playerok";
import { starvell } from "./starvell";
import { beepro } from "./beepro";

/**
 * Registered marketplace search modules. Add or remove entries here
 * to change which sources the internal /api/search endpoint queries.
 * Every provider runs in parallel; a failure in one never affects the others.
 */
export const providers: SearchProvider[] = [funpay, playerok, starvell, beepro];
