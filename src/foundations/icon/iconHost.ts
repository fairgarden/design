import styles from './icon.module.css'

/**
 * The host class for `weight="interactive"` icons (§10.1 icon states). Add it
 * to the element whose hover or press swaps the icon to its emphasis weight
 * (a button, a cell, a link), or compose it in the host's module:
 * `composes: iconHost from '../icon/icon.module.css'`. Kept out of the
 * client module, so a server component reads the class name itself.
 */
export const iconHost: string = styles.iconHost
