/* Harvest Trend · รู้ทันราคา — official production cost (ต้นทุนการผลิต) data
   curated from data.go.th provincial-office open datasets (fetched 2026-08-16
   by scripts/fetch-costs.mjs). Every value carries its source dataset, year,
   province and unit. No fabricated numbers: a crop is present only when an
   open official dataset with sane values exists.
   - beef (dataset 12_112): 2568 rows contain absurd values (10–42M บาท/ตัว,
     vs ~140–322k in 2561) → excluded as unreliable.
   - mango (doae_04): dataset is "% reduction", not an absolute cost → excluded.
   So coverage = 10 of 25 crops; the rest show "no official data". */

export interface CostEntry {
  crop: string;      // crop id in lib/data.ts
  value: number;     // latest-year value (district average where applicable)
  unit: string;      // display unit, th
  year: number;      // Buddhist year of the value
  prov: string;      // th province name (dataset's province)
  srcId: string;     // data.go.th dataset id
  srcTitle: string;
  perRai: boolean;   // true = cost per rai → break-even = cost / yield(kg/rai)
  note?: string;     // scope caveat, e.g. district average
}

export const COST_DATA: Record<string, CostEntry> = {
  durian: {
    crop: 'durian', value: 26754, unit: 'บาท/ไร่', year: 2568, prov: 'นราธิวาส',
    srcId: '26_32', srcTitle: 'ต้นทุนการผลิตทุเรียนต่อไร่แปลงทั่วไป', perRai: true,
    note: 'ทุเรียนแปลงทั่วไป'
  },
  rice: {
    crop: 'rice', value: 6543, unit: 'บาท/ไร่', year: 2568, prov: 'อุตรดิตถ์',
    srcId: '11-24', srcTitle: 'ต้นทุนการผลิตข้าว', perRai: true,
    note: 'เฉลี่ยต่อไร่ (นาปี/นาปรัง)'
  },
  corn: {
    crop: 'corn', value: 4291.33, unit: 'บาท/ไร่', year: 2566, prov: 'นครราชสีมา',
    srcId: 'production-costs-corn', srcTitle: 'ต้นทุนการผลิตข้าวโพดเลี้ยงสัตว์', perRai: true,
    note: 'เฉลี่ย 9 อำเภอที่มีข้อมูล (จาก 32 อำเภอ)'
  },
  cassava: {
    crop: 'cassava', value: 5021.83, unit: 'บาท/ไร่', year: 2566, prov: 'นครราชสีมา',
    srcId: '2565-25662', srcTitle: 'ต้นทุนการผลิตพืชเศรษฐกิจ (มันสำปะหลัง)', perRai: true,
    note: 'เฉลี่ย 29 อำเภอที่มีข้อมูล (จาก 32 อำเภอ)'
  },
  sugarcane: {
    crop: 'sugarcane', value: 8845.75, unit: 'บาท/ไร่', year: 2566, prov: 'นครราชสีมา',
    srcId: 'kaset-khorat-sugar-cane', srcTitle: 'ต้นทุนการผลิตอ้อยโรงงาน', perRai: true,
    note: 'เฉลี่ย 8 อำเภอที่มีข้อมูล (จาก 32 อำเภอ)'
  },
  palm: {
    crop: 'palm', value: 9327.69, unit: 'บาท/ไร่', year: 2567, prov: 'ตรัง',
    srcId: 'dataset_50_542', srcTitle: 'ต้นทุนการผลิตปาล์มน้ำมัน', perRai: true,
    note: 'ต้นทุนรวมต่อไร่'
  },
  longan: {
    crop: 'longan', value: 16.25, unit: 'บาท/กก.', year: 2567, prov: 'จันทบุรี',
    srcId: 'dataset_12_155', srcTitle: 'ต้นทุนการผลิตลำไย', perRai: false
  },
  coffee: {
    crop: 'coffee', value: 3200, unit: 'บาท/ไร่', year: 2567, prov: 'เลย',
    srcId: 'dataset_10_254', srcTitle: 'ต้นทุนในการผลิตกาแฟต่อไร่', perRai: true
  },
  pineapple: {
    crop: 'pineapple', value: 7.31, unit: 'บาท/กก.', year: 2568, prov: 'ลำปาง',
    srcId: 'dataset_31_143', srcTitle: 'ต้นทุนการปลูกสับปะรด', perRai: false
  },
  broiler: {
    crop: 'broiler', value: 79.59, unit: 'บาท/ตัว', year: 2566, prov: 'แม่ฮ่องสอน',
    srcId: 'dataset_4_03', srcTitle: 'ต้นทุนการเลี้ยงไก่เนื้อ', perRai: false
  }
};

export function costFor(crop: string): CostEntry | null {
  return COST_DATA[crop] ?? null;
}
