<script setup lang="ts">
import { computed } from 'vue'
import { RouterLink, type RouteLocationRaw } from 'vue-router'
const props = withDefaults(defineProps<{
  variant?: 'neutral' | 'brand' | 'weak' | 'outline' | 'ghost'
  size?: 's' | 'm' | 'l'; to?: RouteLocationRaw; href?: string
  icon?: 'arrow' | 'down' | 'next' | 'retry'; block?: boolean; loading?: boolean; disabled?: boolean
  type?: 'button' | 'submit' | 'reset'; canonical?: boolean
}>(), { variant: 'neutral', size: 'm', type: 'button' })
const elementProps = computed(() => props.to ? { to: props.to } : props.href ? { href: props.href } : { type: props.type, disabled: props.disabled || props.loading })
function guardClick(event: MouseEvent) {
  if (!props.disabled && !props.loading) return
  event.preventDefault()
  event.stopImmediatePropagation()
}
const icons = { arrow: '↗', down: '↓', next: '→', retry: '↻' }
</script>
<template>
  <component :is="to ? RouterLink : href ? 'a' : 'button'" v-bind="elementProps"
    class="home-button" :class="[variant === 'neutral' ? 'home-button--dark' : variant === 'brand' ? 'home-button--accent' : undefined,
      !canonical ? ['ui-button', `ui-button--${variant}`, `ui-button--${size}`, { 'ui-button--block': block }] : undefined]"
    :tabindex="(to || href) && (disabled || loading) ? -1 : undefined" :aria-disabled="to || href ? (disabled || loading || undefined) : undefined"
    :aria-busy="loading || undefined" @click.capture="guardClick">
    <slot /><span v-if="loading" class="ui-button-loader" aria-hidden="true">◌</span><span v-else-if="icon" aria-hidden="true">{{ icons[icon] }}</span>
  </component>
</template>
