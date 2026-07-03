import { describe, expect, it } from 'vitest'
import { mount } from '@vue/test-utils'
import StatusIndicator from '@/popup/components/StatusIndicator.vue'

describe('StatusIndicator', () => {
  it('should render green lamp when integration is present', () => {
    // Arrange
    const wrapper = mount(StatusIndicator, {
      props: {
        label: 'Hawk',
        present: true,
      },
    })

    // Act
    const lamp = wrapper.get('.status-indicator__lamp')

    // Assert
    expect(lamp.classes()).toContain('status-indicator__lamp--on')
    expect(wrapper.text()).toBe('Hawk')
  })

  it('should render red lamp when integration is absent', () => {
    // Arrange
    const wrapper = mount(StatusIndicator, {
      props: {
        label: 'Sentry',
        present: false,
      },
    })

    // Act
    const lamp = wrapper.get('.status-indicator__lamp')

    // Assert
    expect(lamp.classes()).toContain('status-indicator__lamp--off')
    expect(wrapper.text()).toBe('Sentry')
  })

  it('should render unknown state while loading', () => {
    // Arrange
    const wrapper = mount(StatusIndicator, {
      props: {
        label: 'Hawk',
        present: null,
      },
    })

    // Act
    const lamp = wrapper.get('.status-indicator__lamp')

    // Assert
    expect(lamp.classes()).toContain('status-indicator__lamp--unknown')
    expect(wrapper.attributes('aria-label')).toBe('Hawk: загрузка')
  })
})
