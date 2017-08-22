import { JumpFm, Panel } from 'jumpfm-api'

import * as fs from 'fs-extra';
import * as homedir from 'homedir';
import * as path from 'path';

export const load = (jumpFm: JumpFm) => {
    const bind = jumpFm.bindKeys
    const shell = jumpFm.electron.shell
    const activePan = jumpFm.getActivePanel

    const step = (d, select = false) => {
        const pan = activePan()
        pan.step(d, select)
    }


    bind('switchPanel', ['tab'], jumpFm.switchPanel).filterMode(['tab'], () => {
        jumpFm.switchPanel()
    })

    bind('up', ['up', ']'], () => step(-1)).filterMode()
    bind('upSelect', ['shift+up', 'shift+]'], () => step(-1, true)).filterMode()
    // bind('pageUp', ['pageup', 'ctrl+]'], () => step(-rowCountInPage()))
    //     .filterMode()
    // bind('pageUpSelect', ['shift+pageup', 'shift+ctrl+]'],
    //     () => step(-rowCountInPage(), true)).filterMode()

    bind('down', ['down', '['], () => step(1))
        .filterMode()
    bind('downSelect', ['shift+down', 'shift+['], () => step(1, true)).filterMode()
    // bind('pageDown', ['pagedown', 'ctrl+['], () => step(rowCountInPage()))
    //     .filterMode()
    // bind('pageDownSelect', ['shift+pagedown', 'shift+ctrl+['],
    //     () => step(rowCountInPage(), true)).filterMode()

    bind('goStart', ['home'], () => step(-9999)).filterMode([])
    bind('goStartSelect', ['shift+home'], () => step(-9999, true)).filterMode([])
    bind('goEnd', ['end'], () => step(9999)).filterMode([])
    bind('goEndSelect', ['shift+end'], () => step(9999, true)).filterMode([])

    bind('selectAll', ['ctrl+a'], () => activePan().selectAll()).filterMode()
    bind('deselectAll', ['esc'], () => {
        activePan().filter.set('')
        activePan().deselectAll()
    }).filterMode([])
    bind('toggleSelection', ['space'], () => activePan().toggleCurSel()).filterMode([])
    bind('hide').filterMode(['esc'], () => activePan().filter.hide())

    const enter = () => {
        const pan = activePan()
        const path = pan.getCurItem().path
        if (fs.statSync(path).isDirectory()) {
            activePan().filter.set('')
            pan.cd(path)
        }
        else shell.openItem(path)
    }

    bind('enter', ['enter'], enter).filterMode()

    bind('back', ['backspace'], () => {
        const pan = activePan()
        pan.cd(path.dirname(pan.getPath()))
    }).filterMode([])

    bind('homeDir', ['ctrl+home'], () => {
        activePan().cd(homedir())
    }).filterMode([])

    bind('openFilter', ['f'], () => activePan().filter.focus())
    bind('likeThis', ['l'], () => {
        const pan = activePan()
        pan.filter.set(path.extname(pan.getCurItem().path))
    }).filterMode([])
    bind('swapPanels', ['s'], jumpFm.swapPanels).filterMode([])

    const openTo = (source: Panel, dist: Panel) => {
        const item = source.getCurItem()
        dist.cd(
            fs.statSync(item.path).isDirectory() ?
                item.path :
                source.getPath()
        )
    }

    bind('openToRight', ['ctrl+right'], () =>
        openTo(
            jumpFm.panels[0],
            jumpFm.panels[1],
        )
    ).filterMode()

    bind('openToLeft', ['ctrl+left'], () =>
        openTo(
            jumpFm.panels[1],
            jumpFm.panels[0],
        )
    ).filterMode()
}