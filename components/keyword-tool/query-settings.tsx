"use client"

import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Input } from "@/components/ui/input"
import { Globe, Package, Clock } from "lucide-react"

interface QuerySettingsProps {
  countryId: string
  batchSize: number
  delay: number
  onCountryChange: (value: string) => void
  onBatchSizeChange: (value: number) => void
  onDelayChange: (value: number) => void
}

const COUNTRIES = [
  { id: "global", name: "全球（不限定）" },
  { id: "2840", name: "美国" },
  { id: "2156", name: "中国" },
  { id: "2826", name: "英国" },
  { id: "2392", name: "日本" },
  { id: "2276", name: "德国" },
  { id: "2250", name: "法国" },
  { id: "2124", name: "加拿大" },
  { id: "2036", name: "澳大利亚" }
]

export function QuerySettings({
  countryId,
  batchSize,
  delay,
  onCountryChange,
  onBatchSizeChange,
  onDelayChange
}: QuerySettingsProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      {/* Country Selection */}
      <div className="space-y-2">
        <Label htmlFor="country" className="flex items-center gap-2">
          <Globe className="h-4 w-4" />
          地理定位（可选）
        </Label>
        <Select value={countryId} onValueChange={onCountryChange}>
          <SelectTrigger id="country">
            <SelectValue placeholder="选择国家/地区" />
          </SelectTrigger>
          <SelectContent>
            {COUNTRIES.map((country) => (
              <SelectItem key={country.id} value={country.id}>
                {country.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Batch Size */}
      <div className="space-y-2">
        <Label htmlFor="batchSize" className="flex items-center gap-2">
          <Package className="h-4 w-4" />
          每批查询数量
        </Label>
        <Input
          id="batchSize"
          type="number"
          value={batchSize}
          onChange={(e) => onBatchSizeChange(parseInt(e.target.value) || 1)}
          min={1}
          max={1000}
        />
      </div>

      {/* Delay */}
      <div className="space-y-2">
        <Label htmlFor="delay" className="flex items-center gap-2">
          <Clock className="h-4 w-4" />
          批次间延迟（秒）
        </Label>
        <Input
          id="delay"
          type="number"
          value={delay}
          onChange={(e) => onDelayChange(parseFloat(e.target.value) || 0)}
          min={0}
          max={10}
          step={0.5}
        />
      </div>
    </div>
  )
}
