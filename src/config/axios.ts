import axios from "axios"

export const api = axios.create({
  baseURL: 'https://dev-back.ru.tuna.am/api',
})

