<script setup>
import 'element-plus/theme-chalk/dark/css-vars.css'
import 'element-plus/es/components/radio-button/style/css'
import 'element-plus/es/components/radio-group/style/css'
import './src/style/overrides.css'
import { ElRadioGroup, ElRadioButton } from 'element-plus'
</script>

# Test

## Section

<ElRadioGroup v-model="radio">
  <ElRadioButton label="1">Option 1</ElRadioButton>
  <ElRadioButton label="2">Option 2</ElRadioButton>
</ElRadioGroup>
