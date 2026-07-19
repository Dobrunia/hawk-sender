import { describe, expect, it } from 'vitest'
import { mount } from '@vue/test-utils'
import EnableToggle from '@/popup/components/EnableToggle.vue'

describe('EnableToggle', () => {
  it('should reflect enabled state in switch aria-checked attribute', () => {
    // Arrange
    const wrapper = mount(EnableToggle, {
      props: {
        modelValue: true,
        label: 'Только .ru-домены',
      },
    })

    // Act
    const ariaChecked = wrapper.get('[role="switch"]').attributes('aria-checked')

    // Assert
    expect(ariaChecked).toBe('true')
    expect(wrapper.get('[role="switch"]').attributes('aria-label')).toBe(
      'Только .ru-домены',
    )
  })

  it('should emit update:modelValue with false when clicked while enabled', async () => {
    // Arrange
    const wrapper = mount(EnableToggle, {
      props: {
        modelValue: true,
        'onUpdate:modelValue': (value: boolean) => wrapper.setProps({ modelValue: value }),
      },
    })

    // Act
    await wrapper.get('[role="switch"]').trigger('click')

    // Assert
    expect(wrapper.emitted('update:modelValue')).toEqual([[false]])
  })
})
