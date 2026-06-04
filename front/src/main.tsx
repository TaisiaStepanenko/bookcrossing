import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'

import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { ReactQueryDevtools } from '@tanstack/react-query-devtools'

import { ConfigProvider } from 'antd'
import dayjs from 'dayjs'
import 'dayjs/locale/ru'

import App from './App'

import './global.scss'

// load on demand

dayjs.locale('ru')

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: 1,
      staleTime: 0,
      gcTime: 0,
    },
  },
})

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <ConfigProvider
          theme={{
            token: {
              colorPrimary: '#63A552',
              colorTextSecondary: '#7D8B9B',
              orange: '#F17300',
              green: '#63A552',
            },
            components: {
              Rate: {
                starColor: '#F17300',
              },
              Button: {
                borderRadius: 50,
                colorBgSolid: '#63A552',
                colorBorder: '#63A552',
                defaultColor: '#63A552',
              },
              Pagination: {
                borderRadius: 50,
                itemActiveBg: '#63A552',
                colorPrimary: '#FFFFFF',
                colorBorderSecondary: '#63A552',
              },
              Tag: {
                borderRadiusSM: 16,
              },
              Typography: {
                marginLG: 0,
                margin: 0,
                titleMarginBottom: 0,
                titleMarginTop: 0,
              },
            },
          }}
        >
          <App />
        </ConfigProvider>
      </BrowserRouter>
    </QueryClientProvider>
  </React.StrictMode>,
)
