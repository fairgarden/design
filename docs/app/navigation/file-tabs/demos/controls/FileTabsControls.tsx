'use client'

import * as React from 'react'
import { Menu as BaseMenu } from '@base-ui/react/menu'
import { Icon } from '@fairgarden/design/foundations/icon'
import {
  FileTabs,
  FileTabsControl,
  FileTabsList,
  FileTabsPanel,
} from '@fairgarden/design/navigation/file-tabs'
import { Menu, MenuItem, MenuPopup } from '@fairgarden/design/overlays/menu'
import styles from './controls.module.css'

const files = [
  {
    name: 'Survey.tsx',
    code: `import { species } from './species'

export function Survey() {
  return <SpeciesList names={species} season="spring" />
}`,
  },
  { name: 'species.ts', code: `export const species = ['Bobolink', 'Meadowlark', 'Kestrel']` },
  {
    name: 'survey.module.css',
    code: `.survey {
  display: grid;
  gap: var(--size-px-2);
}`,
  },
]

/** The ⋮ Menu: a FileTabsControl is its trigger, and its popup aligns to the end. */
function MoreActions({ file }: { file: string }) {
  return (
    <Menu>
      <BaseMenu.Trigger render={<FileTabsControl />} aria-label="More actions">
        <Icon name="more_horiz" weight="interactive" />
      </BaseMenu.Trigger>
      <MenuPopup align="end">
        <MenuItem icon="content_copy">Copy {file}</MenuItem>
        <MenuItem icon="download">Download {file}</MenuItem>
        <MenuItem icon="open_in_new">View {file} source</MenuItem>
      </MenuPopup>
    </Menu>
  )
}

function SurveyFiles() {
  const [selected, setSelected] = React.useState(files[0].name)
  const current = files.find((file) => file.name === selected) ?? files[0]

  return (
    <FileTabs
      tabs={files.map((file) => ({ id: file.name, name: file.name }))}
      value={selected}
      onValueChange={setSelected}
      controls={<MoreActions file={selected} />}
      className={styles.frame}
    >
      <FileTabsList />
      <FileTabsPanel>
        <pre className={styles.code}>
          <code>{current.code}</code>
        </pre>
      </FileTabsPanel>
    </FileTabs>
  )
}

/**
 * The same files and ⋮ Menu in two columns. The first keeps a 44 px end
 * gutter, so the trigger hangs just outside the frame and the tabs keep the
 * whole header. The second is narrow and clips at its edge, so the trigger
 * falls back to a cell at the header's end.
 */
export function FileTabsControls() {
  return (
    <div className={styles.stack}>
      <div className={styles.gutter}>
        <SurveyFiles />
      </div>
      <div className={styles.narrow}>
        <SurveyFiles />
      </div>
    </div>
  )
}
