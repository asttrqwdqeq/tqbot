import { api } from "@/config/axios"

export async function post(url: string, data: any) {
  const res = await api.post(url, data).then(res => res).catch(err => {
    console.log(err.response.data)
    return err
  })
  return {data: res.data || res.response.data.message, status: res.status}
}