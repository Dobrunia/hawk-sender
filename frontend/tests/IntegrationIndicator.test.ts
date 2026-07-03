import { describe, expect, it } from 'vitest'
import { mount } from '@vue/test-utils'
import IntegrationIndicator from '@/popup/components/IntegrationIndicator.vue'

describe('IntegrationIndicator', () => {
  it('should render green lamp when integration is present', () => {
    // Arrange
    const wrapper = mount(IntegrationIndicator, {
      props: {
        label: 'Hawk',
        present: true,
      },
    })

    // Act
    const lamp = wrapper.get('.integration-indicator__lamp')

    // Assert
    expect(lamp.classes()).toContain('integration-indicator__lamp--on')
    expect(wrapper.text()).toBe('Hawk')
  })

  it('should render red lamp when integration is absent', () => {
    // Arrange
    const wrapper = mount(IntegrationIndicator, {
      props: {
        label: 'Sentry',
        present: false,
      },
    })

    // Act
    const lamp = wrapper.get('.integration-indicator__lamp')

    // Assert
    expect(lamp.classes()).toContain('integration-indicator__lamp--off')
    expect(wrapper.text()).toBe('Sentry')
  })

  it('should render unknown state while loading', () => {
    // Arrange
    const wrapper = mount(IntegrationIndicator, {
      props: {
        label: 'Hawk',
        present: null,
      },
    })

    // Act
    const lamp = wrapper.get('.integration-indicator__lamp')

    // Assert
    expect(lamp.classes()).toContain('integration-indicator__lamp--unknown')
    expect(wrapper.attributes('aria-label')).toBe('Hawk: загрузка')
  })
})
