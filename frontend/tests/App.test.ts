import { beforeEach, describe, expect, it, vi } from 'vitest'
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
    progress: ref(null),
    loading: ref(false),
    refresh: vi.fn(),
    rerunForActiveTab: vi.fn(),
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

describe('App', () => {
  beforeEach(() => {
    vi.mocked(useExtensionSettings).mockReturnValue({
      enabled: ref(true),
      loading: ref(false),
      setEnabled: vi.fn(),
    })
    vi.mocked(useAutomaticWorkflowOutcome).mockReturnValue({
      outcome: ref(null),
      progress: ref(null),
      loading: ref(false),
      refresh: vi.fn(),
      rerunForActiveTab: vi.fn(),
    })
  })

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

  it('should rerun workflow after toggle change', async () => {
    // Arrange
    const rerunForActiveTab = vi.fn().mockResolvedValue(undefined)
    const setEnabled = vi.fn().mockResolvedValue(undefined)
    vi.mocked(useExtensionSettings).mockReturnValue({
      enabled: ref(true),
      loading: ref(false),
      setEnabled,
    })
    vi.mocked(useAutomaticWorkflowOutcome).mockReturnValue({
      outcome: ref(null),
      progress: ref(null),
      loading: ref(false),
      refresh: vi.fn(),
      rerunForActiveTab,
    })
    const wrapper = mount(App)

    // Act
    await wrapper.find('[role="switch"]').trigger('click')

    // Assert
    expect(setEnabled).toHaveBeenCalledWith(false)
    expect(rerunForActiveTab).toHaveBeenCalledWith(false)
  })

  it('should rerun workflow when toggle is enabled', async () => {
    // Arrange
    const rerunForActiveTab = vi.fn().mockResolvedValue(undefined)
    const setEnabled = vi.fn().mockResolvedValue(undefined)
    vi.mocked(useExtensionSettings).mockReturnValue({
      enabled: ref(false),
      loading: ref(false),
      setEnabled,
    })
    vi.mocked(useAutomaticWorkflowOutcome).mockReturnValue({
      outcome: ref(null),
      progress: ref(null),
      loading: ref(false),
      refresh: vi.fn(),
      rerunForActiveTab,
    })
    const wrapper = mount(App)

    // Act
    await wrapper.find('[role="switch"]').trigger('click')

    // Assert
    expect(setEnabled).toHaveBeenCalledWith(true)
    expect(rerunForActiveTab).toHaveBeenCalledWith(true)
  })

  it('should render HAWK_INSTALLED workflow outcome on current page', () => {
    // Arrange
    vi.mocked(useAutomaticWorkflowOutcome).mockReturnValue({
      outcome: ref(WORKFLOW_OUTCOMES.HAWK_INSTALLED),
      progress: ref(null),
      loading: ref(false),
      refresh: vi.fn(),
      rerunForActiveTab: vi.fn(),
    })
    const wrapper = mount(App)

    // Act
    const text = wrapper.text()

    // Assert
    expect(text).toContain('Hawk установлен')
  })

  it('should not render workflow outcome when extension is disabled', () => {
    // Arrange
    vi.mocked(useExtensionSettings).mockReturnValue({
      enabled: ref(false),
      loading: ref(false),
      setEnabled: vi.fn(),
    })
    vi.mocked(useAutomaticWorkflowOutcome).mockReturnValue({
      outcome: ref(null),
      progress: ref(null),
      loading: ref(false),
      refresh: vi.fn(),
      rerunForActiveTab: vi.fn(),
    })
    const wrapper = mount(App)

    // Act
    const text = wrapper.text()

    // Assert
    expect(text).not.toContain('Ошибка helper')
    expect(text).not.toContain('Автоматическая отправка неактивна')
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

  it('should render current workflow progress', () => {
    // Arrange
    vi.mocked(useAutomaticWorkflowOutcome).mockReturnValue({
      outcome: ref(null),
      progress: ref({
        status: 'running',
        message: 'Проверяем историю отправок по домену',
        stepId: 'check_domain_send_history',
        stepIndex: 4,
        stepTotal: 6,
      }),
      loading: ref(true),
      refresh: vi.fn(),
      rerunForActiveTab: vi.fn(),
    })
    const wrapper = mount(App)

    // Assert
    expect(wrapper.text()).toContain('Проверяем историю отправок по домену')
    expect(wrapper.text()).toContain('Шаг 5 из 6')
  })

  it('should rerun workflow when manual send button is clicked', async () => {
    // Arrange
    const rerunForActiveTab = vi.fn().mockResolvedValue(undefined)
    vi.mocked(useAutomaticWorkflowOutcome).mockReturnValue({
      outcome: ref(null),
      progress: ref(null),
      loading: ref(false),
      refresh: vi.fn(),
      rerunForActiveTab,
    })
    const wrapper = mount(App)

    // Act
    await wrapper.find('.manual-send').trigger('click')

    // Assert
    expect(rerunForActiveTab).toHaveBeenCalledWith(true)
  })
})
