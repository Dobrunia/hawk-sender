import { describe, expect, it, vi } from 'vitest'
import { ref } from 'vue'
import { mount } from '@vue/test-utils'
import App from '@/popup/App.vue'
import { useExtensionSettings } from '@/popup/composables/useExtensionSettings'
import { useAutomaticWorkflowOutcome } from '@/popup/composables/useAutomaticWorkflowOutcome'
import { WORKFLOW_OUTCOMES } from '@/shared/workflow/outcomes'

vi.mock('@/popup/composables/useExtensionSettings', () => ({
  useExtensionSettings: vi.fn(() => ({
    enabled: ref(true),
    loading: ref(false),
    setEnabled: vi.fn(),
  })),
}))

vi.mock('@/popup/composables/useAutomaticWorkflowOutcome', () => ({
  useAutomaticWorkflowOutcome: vi.fn(() => ({
    outcome: ref(null),
    loading: ref(false),
    refresh: vi.fn(),
  })),
}))

vi.mock('@/popup/composables/usePageIntegrations', () => ({
  usePageIntegrations: () => ({
    hawk: ref(true),
    sentry: ref(false),
    loading: ref(false),
    refresh: vi.fn(),
  }),
}))

vi.mock('@/popup/composables/useManualSend', () => ({
  useManualSend: vi.fn(() => ({
    loading: ref(false),
    result: ref(null),
    display: ref(null),
    send: vi.fn(),
  })),
}))

vi.mock('@/popup/composables/useServerControl', () => ({
  useServerControl: vi.fn(() => ({
    loading: ref(false),
    actionLoading: ref(false),
    online: ref(true),
    smtpConfigured: ref(true),
    nativeAvailable: ref(true),
    message: ref(''),
    start: vi.fn(),
    stop: vi.fn(),
    refreshStatus: vi.fn(),
  })),
}))

describe('App', () => {
  it('should render title without workflow label when workflow has no outcome', () => {
    // Arrange
    const wrapper = mount(App)

    // Act
    const text = wrapper.text()

    // Assert
    expect(text).toContain('Hawk Sender')
    expect(text).not.toContain('Активно')
    expect(text).toContain('Автосбор и отправка')
  })

  it('should refresh workflow after toggle change', async () => {
    // Arrange
    const refresh = vi.fn()
    const setEnabled = vi.fn().mockResolvedValue(undefined)
    vi.mocked(useExtensionSettings).mockReturnValue({
      enabled: ref(true),
      loading: ref(false),
      setEnabled,
    })
    vi.mocked(useAutomaticWorkflowOutcome).mockReturnValue({
      outcome: ref(null),
      loading: ref(false),
      refresh,
    })
    const wrapper = mount(App)

    // Act
    await wrapper.find('[role="switch"]').trigger('click')

    // Assert
    expect(setEnabled).toHaveBeenCalledWith(false)
    expect(refresh).toHaveBeenCalled()
  })

  it('should render HAWK_INSTALLED workflow outcome on current page', () => {
    // Arrange
    vi.mocked(useAutomaticWorkflowOutcome).mockReturnValue({
      outcome: ref(WORKFLOW_OUTCOMES.HAWK_INSTALLED),
      loading: ref(false),
      refresh: vi.fn(),
    })
    const wrapper = mount(App)

    // Act
    const text = wrapper.text()

    // Assert
    expect(text).toContain('Hawk установлен')
  })

  it('should render inactive workflow outcome when extension is disabled', () => {
    // Arrange
    vi.mocked(useExtensionSettings).mockReturnValue({
      enabled: ref(false),
      loading: ref(false),
      setEnabled: vi.fn(),
    })
    vi.mocked(useAutomaticWorkflowOutcome).mockReturnValue({
      outcome: ref(WORKFLOW_OUTCOMES.AUTO_SEND_INACTIVE),
      loading: ref(false),
      refresh: vi.fn(),
    })
    const wrapper = mount(App)

    // Act
    const text = wrapper.text()

    // Assert
    expect(text).toContain('Автоматическая отправка неактивна')
  })

  it('should render hawk and sentry integration indicators', () => {
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

  it('should render manual send button', () => {
    // Arrange
    const wrapper = mount(App)

    // Assert
    expect(wrapper.text()).toContain('Отправить вручную')
  })

  it('should render server control section', () => {
    // Arrange
    const wrapper = mount(App)

    // Assert
    expect(wrapper.text()).toContain('Server')
    expect(wrapper.text()).toContain('Остановить')
  })
})
