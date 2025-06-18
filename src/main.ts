import { mount } from 'svelte'
import './popup.css'
import Popup from './popup.svelte'

const popup = mount(Popup, {
  target: document.getElementById('app')!,
})

export default popup
