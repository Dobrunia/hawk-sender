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
    expect(wrapper.attributes('aria-label')).toBe('Hawk: есть')
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
    expect(wrapper.attributes('aria-label')).toBe('Sentry: нет')
  })

  it('should render loading state', () => {
    // Arrange
    const wrapper = mount(IntegrationIndicator, {
      props: {
        label: 'Hawk',
        present: null,
        loading: true,
      },
    })

    // Act
    const lamp = wrapper.get('.integration-indicator__lamp')

    // Assert
    expect(lamp.classes()).toContain('integration-indicator__lamp--unknown')
    expect(wrapper.text()).toBe('Hawk')
    expect(wrapper.attributes('aria-label')).toBe('Hawk: проверка')
  })

  it('should render unknown state after unavailable check', () => {
    // Arrange
    const wrapper = mount(IntegrationIndicator, {
      props: {
        label: 'Hawk',
        present: null,
      },
    })

    // Assert
    expect(wrapper.text()).toBe('Hawk')
    expect(wrapper.attributes('aria-label')).toBe('Hawk: неизвестно')
  })
})
