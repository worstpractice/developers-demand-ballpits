import type { IpV4Address } from '../../typings/IpV4Address';
import { randomByte } from './randomByte';

/**
 * This is hardly a brilliant way of generating IPv4 adressess.
 *
 * Among a number of issues, even for this limited use case, it cannot guarantee unique IPs.
 *
 * I must also note that it completely ignores unroutable IPs, internal IPs, reserved IPs, and so on.
 *
 * @see https://en.wikipedia.org/wiki/Bogon_filtering
 * @see https://en.wikipedia.org/wiki/Martian_packet
 */
export const randomIpv4Address = (): IpV4Address => {
  return `${randomByte()}.${randomByte()}.${randomByte()}.${randomByte()}`;
};
