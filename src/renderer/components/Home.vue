<template>
  <div class="row d-flex justify-content-center h-100">
      <div class="col-md-6 my-auto text-center">
          <button :disabled='this.isDisabled' class="btn btn-primary" @click="getToken">Получить  токен</button>
          <div v-if="token !== ''" class="my-2 d-flex flex-row justify-content-center">
            <p class="mr-2 lead">Token: </p>
            <p class="lead">{{token}}</p>
          </div>
          <div v-if="error !== ''" class="my-2 d-flex flex-row justify-content-center">
            <p class="mr-2 lead">Ошибка: </p>
            <p class="lead">{{error}}</p>
          </div>
      </div>
  </div>
</template>

<script>
import { ipcRenderer } from 'electron'
export default {
  data: () => {
    return {
      token: '',
      error: '',
      dis: false
    }
  },
  methods: {
    getToken () {
      this.dis = true
      this.token = 'Пожалуйста, подождите'
      this.error = ''
      ipcRenderer.send('HomePage', 'GetToken')
    }
  },
  mounted () {
    ipcRenderer.on('HomePage', (event, message, info) => {
      this.dis = false
      this.token = ''
      switch (message) {
        case 'ok':
          this.token = info
          break
        case 'reject':
          this.token = ''
          break
        case 'error':
          this.error = info
          break
        default:
          break
      }
    })
  },
  computed: {
    isDisabled () {
      return this.dis
    }
  }
}
</script>

<style>

</style>