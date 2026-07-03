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
    expect(wrapper.text()).toContain('Hawk')
    expect(wrapper.text()).toContain('Есть')
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
    expect(wrapper.text()).toContain('Sentry')
    expect(wrapper.text()).toContain('Нет')
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
    expect(wrapper.text()).toContain('Проверка')
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
    expect(wrapper.text()).toContain('Неизвестно')
    expect(wrapper.attributes('aria-label')).toBe('Hawk: неизвестно')
  })
})
