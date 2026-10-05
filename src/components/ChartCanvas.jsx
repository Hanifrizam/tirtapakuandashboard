import Chart from 'chart.js/auto'
import { useEffect, useRef } from 'react'

/**
 * Wrapper tipis di atas Chart.js.
 * Membuat chart berdasarkan `data`/`options`, dan menghancurkan instance
 * lama setiap kali konfigurasi berubah.
 */
export default function ChartCanvas({ type, data, options, height = 280 }) {
  const canvasRef = useRef(null)
  const chartRef = useRef(null)

  useEffect(() => {
    if (!canvasRef.current) return undefined

    chartRef.current = new Chart(canvasRef.current, { type, data, options })

    return () => {
      chartRef.current?.destroy()
      chartRef.current = null
    }
  }, [type, data, options])

  return (
    <div className="chart-wrap" style={{ height }}>
      <canvas ref={canvasRef} />
    </div>
  )
}