import { Employee } from '@/types/calendar';

// 班長のマスターデータ
export const mockEmployees: Employee[] = [
    { id: '1', name: '備考', nickname: '備考' },
    { id: '2', name: '東本', nickname: '東本' },
    { id: '3', name: '龍成工業', nickname: '龍成工業' },
    { id: '4', name: '田畑', nickname: '田畑' },
    { id: '5', name: '八田', nickname: '八田' },
    { id: '6', name: '楠岡', nickname: '楠岡' },
    { id: '7', name: '小笠原', nickname: '小笠原' },
    { id: '8', name: '和馬', nickname: '和馬' },
    { id: '9', name: '修栄工業', nickname: '修栄工業' },
    { id: '10', name: '開成工業', nickname: '開成工業' },
    { id: '11', name: '玉ノ井', nickname: '玉ノ井' },
];

// 未割り当て用の特別な社員
export const unassignedEmployee: Employee = {
    id: 'unassigned',
    name: '残り人数',
    nickname: '残り人数',
};
