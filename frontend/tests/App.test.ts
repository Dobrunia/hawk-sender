import { describe, expect, it, vi } from 'vitest'
import { ref } from 'vue'
import { mount } from '@vue/test-utils'
import App from '@/popup/App.vue'

vi.mock('@/popup/composables/useExtensionSettings', () => ({
  useExtensionSettings: () => ({
    enabled: ref(true),
    loading: ref(false),
    setEnabled: vi.fn(),
  }),
}))

vi.mock('@/popup/composables/useIntegrationStatus', () => ({
  useIntegrationStatus: () => ({
    hawk: ref(true),
    sentry: ref(false),
    loading: ref(false),
    refresh: vi.fn(),
  }),
}))

describe('App', () => {
  it('should render title and active status when extension is enabled', () => {
    // Arrange
    const wrapper = mount(App)

    // Act
    const text = wrapper.text()

    // Assert
    expect(text).toContain('Hawk Sender')
    expect(text).toContain('Активно')
    expect(text).toContain('Автосбор и отправка')
  })

  it('should render hawk and sentry integration status rows', () => {
    // Arrange
    const wrapper = mount(App)

    // Act
    const text = wrapper.text()

    // Assert
    expect(text).toContain('Hawk')
    expect(text).toContain('Sentry')
    expect(text).not.toContain('Есть')
    expect(text).not.toContain('Нет')
  })
})
