'use client';

import React, { useState, useEffect } from 'react';
import { ProjectMaster, ConstructionType } from '../types/projectMaster';
import { ProjectAssignment } from '../types/projectAssignment';
import { Employee } from '../types/calendar';
import { CONSTRUCTION_TYPE_LABELS } from '../types/calendar';
import { mockEmployees } from '../data/mockEmployees';

interface ProjectAssignmentFormProps {
    isOpen: boolean;
    onClose: () => void;
    onSave: (assignment: Omit<ProjectAssignment, 'id' | 'createdAt' | 'updatedAt'>) => void;
    projectMaster: ProjectMaster;
    preselectedLeaderId?: string;
    preselectedDate?: string;
}

export default function ProjectAssignmentForm({
    isOpen,
    onClose,
    onSave,
    projectMaster,
    preselectedLeaderId,
    preselectedDate,
}: ProjectAssignmentFormProps) {
    const employees = mockEmployees.filter(emp => emp.id !== '1'); // 備考を除外

    const [selectedType, setSelectedType] = useState<ConstructionType>('assembly');
    const [startDate, setStartDate] = useState('');
    const [endDate, setEndDate] = useState('');
    const [leaderId, setLeaderId] = useState('');
    const [memberCount, setMemberCount] = useState(1);
    const [assignedStaff, setAssignedStaff] = useState<string[]>([]);

    // 初期値の設定
    useEffect(() => {
        if (isOpen) {
            // 工事種別の初期値(最初の種別を選択)
            if (projectMaster.constructionTypes.length > 0) {
                const firstType = projectMaster.constructionTypes[0];
                setSelectedType(firstType.type);
                setStartDate(firstType.scheduledStartDate || preselectedDate || '');
                setEndDate(firstType.scheduledEndDate || '');
            }

            // 職長の初期値
            if (preselectedLeaderId) {
                setLeaderId(preselectedLeaderId);
            }
        }
    }, [isOpen, projectMaster, preselectedLeaderId, preselectedDate]);

    // 工事種別が変更されたら予定日を更新
    useEffect(() => {
        const typeInfo = projectMaster.constructionTypes.find((ct) => ct.type === selectedType);
        if (typeInfo) {
            setStartDate(typeInfo.scheduledStartDate || '');
            setEndDate(typeInfo.scheduledEndDate || '');
        }
    }, [selectedType, projectMaster]);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        if (!leaderId || !startDate) {
            alert('職長と開始日は必須です');
            return;
        }

        const assignment: Omit<ProjectAssignment, 'id' | 'createdAt' | 'updatedAt'> = {
            projectMasterId: projectMaster.id,
            constructionType: selectedType,
            actualStartDate: startDate,
            actualEndDate: endDate || undefined,
            leaderId,
            memberCount,
            assignedStaff,
        };

        onSave(assignment);
        handleClose();
    };

    const handleClose = () => {
        // フォームをリセット
        setSelectedType('assembly');
        setStartDate('');
        setEndDate('');
        setLeaderId('');
        setMemberCount(1);
        setAssignedStaff([]);
        onClose();
    };

    const toggleStaff = (staffId: string) => {
        setAssignedStaff((prev) =>
            prev.includes(staffId) ? prev.filter((id) => id !== staffId) : [...prev, staffId]
        );
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 lg:left-64 bg-black bg-opacity-50 flex items-center justify-center z-[60]">
            <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] flex flex-col">
                {/* ヘッダー */}
                <div className="px-6 py-4 border-b border-gray-200">
                    <div className="flex items-center justify-between">
                        <h2 className="text-xl font-bold text-gray-800">案件を割り当て</h2>
                        <button
                            onClick={handleClose}
                            className="text-gray-400 hover:text-gray-600 transition-colors"
                        >
                            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                        </button>
                    </div>
                </div>

                {/* フォーム */}
                <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto px-6 py-4">
                    {/* 案件情報 */}
                    <div className="mb-6 p-4 bg-blue-50 rounded-lg">
                        <h3 className="font-bold text-gray-800 mb-2">{projectMaster.siteName}</h3>
                        {projectMaster.parentCompany && (
                            <p className="text-sm text-gray-600">元請会社: {projectMaster.parentCompany}</p>
                        )}
                    </div>

                    {/* 工事種別選択 */}
                    <div className="mb-6">
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            工事種別 <span className="text-red-500">*</span>
                        </label>
                        <div className="flex gap-2">
                            {projectMaster.constructionTypes.map((ct) => (
                                <button
                                    key={ct.type}
                                    type="button"
                                    onClick={() => setSelectedType(ct.type)}
                                    className={`px-4 py-2 rounded-lg font-medium transition-colors ${selectedType === ct.type
                                        ? ct.type === 'assembly'
                                            ? 'bg-blue-500 text-white'
                                            : ct.type === 'demolition'
                                                ? 'bg-red-500 text-white'
                                                : 'bg-yellow-500 text-white'
                                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                                        }`}
                                >
                                    {CONSTRUCTION_TYPE_LABELS[ct.type]}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* 日付 */}
                    <div className="grid grid-cols-2 gap-4 mb-6">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                開始日 <span className="text-red-500">*</span>
                            </label>
                            <input
                                type="date"
                                value={startDate}
                                onChange={(e) => setStartDate(e.target.value)}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                required
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">終了日</label>
                            <input
                                type="date"
                                value={endDate}
                                onChange={(e) => setEndDate(e.target.value)}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            />
                        </div>
                    </div>

                    {/* 職長選択 */}
                    <div className="mb-6">
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            職長 <span className="text-red-500">*</span>
                        </label>
                        <select
                            value={leaderId}
                            onChange={(e) => setLeaderId(e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            required
                        >
                            <option value="">選択してください</option>
                            {employees.map((emp: Employee) => (
                                <option key={emp.id} value={emp.id}>
                                    {emp.name}
                                </option>
                            ))}
                        </select>
                    </div>

                    {/* 作業員数 */}
                    <div className="mb-6">
                        <label className="block text-sm font-medium text-gray-700 mb-2">作業員数</label>
                        <input
                            type="number"
                            min="1"
                            value={memberCount}
                            onChange={(e) => setMemberCount(parseInt(e.target.value) || 1)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        />
                    </div>

                    {/* スタッフ割り当て */}
                    <div className="mb-6">
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            スタッフ割り当て (任意)
                        </label>
                        <div className="border border-gray-300 rounded-lg p-4 max-h-48 overflow-y-auto">
                            {employees.map((emp: Employee) => (
                                <label key={emp.id} className="flex items-center py-2 hover:bg-gray-50 cursor-pointer">
                                    <input
                                        type="checkbox"
                                        checked={assignedStaff.includes(emp.id)}
                                        onChange={() => toggleStaff(emp.id)}
                                        className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                                    />
                                    <span className="ml-3 text-gray-700">{emp.name}</span>
                                </label>
                            ))}
                        </div>
                    </div>
                </form>

                {/* フッター */}
                <div className="px-6 py-4 border-t border-gray-200 bg-gray-50 flex justify-end gap-3">
                    <button
                        type="button"
                        onClick={handleClose}
                        className="px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                    >
                        キャンセル
                    </button>
                    <button
                        onClick={handleSubmit}
                        className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
                    >
                        割り当てを保存
                    </button>
                </div>
            </div>
        </div>
    );
}
