'use client';

import React, { useState } from 'react';
import { ProjectMaster, ConstructionTypeInfo } from '../types/projectMaster';
import { useProjectMaster } from '../contexts/ProjectMasterContext';
import { CONSTRUCTION_TYPE_LABELS } from '../types/calendar';

interface ProjectMasterFormProps {
    isOpen: boolean;
    onClose: () => void;
    onSave?: (master: ProjectMaster) => void;
    initialData?: ProjectMaster;
}

export default function ProjectMasterForm({
    isOpen,
    onClose,
    onSave,
    initialData,
}: ProjectMasterFormProps) {
    const { addProjectMaster, updateProjectMaster } = useProjectMaster();

    const [siteName, setSiteName] = useState(initialData?.siteName || '');
    const [parentCompany, setParentCompany] = useState(initialData?.parentCompany || '');
    const [selectedTypes, setSelectedTypes] = useState<{
        assembly: boolean;
        demolition: boolean;
        other: boolean;
    }>({
        assembly: initialData?.constructionTypes.some((ct) => ct.type === 'assembly') || false,
        demolition: initialData?.constructionTypes.some((ct) => ct.type === 'demolition') || false,
        other: initialData?.constructionTypes.some((ct) => ct.type === 'other') || false,
    });

    const [assemblyStart, setAssemblyStart] = useState(
        initialData?.constructionTypes.find((ct) => ct.type === 'assembly')?.scheduledStartDate || ''
    );
    const [assemblyEnd, setAssemblyEnd] = useState(
        initialData?.constructionTypes.find((ct) => ct.type === 'assembly')?.scheduledEndDate || ''
    );
    const [demolitionStart, setDemolitionStart] = useState(
        initialData?.constructionTypes.find((ct) => ct.type === 'demolition')?.scheduledStartDate || ''
    );
    const [demolitionEnd, setDemolitionEnd] = useState(
        initialData?.constructionTypes.find((ct) => ct.type === 'demolition')?.scheduledEndDate || ''
    );
    const [otherStart, setOtherStart] = useState(
        initialData?.constructionTypes.find((ct) => ct.type === 'other')?.scheduledStartDate || ''
    );
    const [otherEnd, setOtherEnd] = useState(
        initialData?.constructionTypes.find((ct) => ct.type === 'other')?.scheduledEndDate || ''
    );

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        if (!siteName.trim()) {
            alert('現場名は必須です');
            return;
        }

        const hasSelectedType = selectedTypes.assembly || selectedTypes.demolition || selectedTypes.other;
        if (!hasSelectedType) {
            alert('少なくとも1つの工事種別を選択してください');
            return;
        }

        const constructionTypes: ConstructionTypeInfo[] = [];

        if (selectedTypes.assembly) {
            constructionTypes.push({
                type: 'assembly',
                scheduledStartDate: assemblyStart || undefined,
                scheduledEndDate: assemblyEnd || undefined,
            });
        }

        if (selectedTypes.demolition) {
            constructionTypes.push({
                type: 'demolition',
                scheduledStartDate: demolitionStart || undefined,
                scheduledEndDate: demolitionEnd || undefined,
            });
        }

        if (selectedTypes.other) {
            constructionTypes.push({
                type: 'other',
                scheduledStartDate: otherStart || undefined,
                scheduledEndDate: otherEnd || undefined,
            });
        }

        if (initialData) {
            // 更新
            updateProjectMaster(initialData.id, {
                siteName,
                parentCompany: parentCompany || undefined,
                constructionTypes,
            });
        } else {
            // 新規作成
            const newMaster = addProjectMaster({
                siteName,
                parentCompany: parentCompany || undefined,
                constructionTypes,
            });

            if (onSave) {
                onSave(newMaster);
            }
        }

        handleClose();
    };

    const handleClose = () => {
        setSiteName('');
        setParentCompany('');
        setSelectedTypes({ assembly: false, demolition: false, other: false });
        setAssemblyStart('');
        setAssemblyEnd('');
        setDemolitionStart('');
        setDemolitionEnd('');
        setOtherStart('');
        setOtherEnd('');
        onClose();
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] flex flex-col">
                {/* ヘッダー */}
                <div className="px-6 py-4 border-b border-gray-200">
                    <div className="flex items-center justify-between">
                        <h2 className="text-xl font-bold text-gray-800">
                            {initialData ? '案件マスター編集' : '案件マスター登録'}
                        </h2>
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
                    {/* 現場名 */}
                    <div className="mb-6">
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            現場名 <span className="text-red-500">*</span>
                        </label>
                        <input
                            type="text"
                            value={siteName}
                            onChange={(e) => setSiteName(e.target.value)}
                            placeholder="例: 帝人"
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            required
                        />
                    </div>

                    {/* 元請会社 */}
                    <div className="mb-6">
                        <label className="block text-sm font-medium text-gray-700 mb-2">元請会社</label>
                        <input
                            type="text"
                            value={parentCompany}
                            onChange={(e) => setParentCompany(e.target.value)}
                            placeholder="例: ○○建設"
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        />
                    </div>

                    {/* 工事種別 */}
                    <div className="mb-6">
                        <label className="block text-sm font-medium text-gray-700 mb-3">
                            工事種別 <span className="text-red-500">*</span>
                        </label>

                        {/* 組立 */}
                        <div className="mb-4">
                            <label className="flex items-center mb-2">
                                <input
                                    type="checkbox"
                                    checked={selectedTypes.assembly}
                                    onChange={(e) =>
                                        setSelectedTypes({ ...selectedTypes, assembly: e.target.checked })
                                    }
                                    className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                                />
                                <span className="ml-2 text-gray-700 font-medium">
                                    {CONSTRUCTION_TYPE_LABELS.assembly}
                                </span>
                            </label>
                            {selectedTypes.assembly && (
                                <div className="ml-6 grid grid-cols-2 gap-3">
                                    <div>
                                        <label className="block text-xs text-gray-600 mb-1">予定開始日</label>
                                        <input
                                            type="date"
                                            value={assemblyStart}
                                            onChange={(e) => setAssemblyStart(e.target.value)}
                                            className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-xs text-gray-600 mb-1">予定終了日</label>
                                        <input
                                            type="date"
                                            value={assemblyEnd}
                                            onChange={(e) => setAssemblyEnd(e.target.value)}
                                            className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                        />
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* 解体 */}
                        <div className="mb-4">
                            <label className="flex items-center mb-2">
                                <input
                                    type="checkbox"
                                    checked={selectedTypes.demolition}
                                    onChange={(e) =>
                                        setSelectedTypes({ ...selectedTypes, demolition: e.target.checked })
                                    }
                                    className="w-4 h-4 text-red-600 border-gray-300 rounded focus:ring-red-500"
                                />
                                <span className="ml-2 text-gray-700 font-medium">
                                    {CONSTRUCTION_TYPE_LABELS.demolition}
                                </span>
                            </label>
                            {selectedTypes.demolition && (
                                <div className="ml-6 grid grid-cols-2 gap-3">
                                    <div>
                                        <label className="block text-xs text-gray-600 mb-1">予定開始日</label>
                                        <input
                                            type="date"
                                            value={demolitionStart}
                                            onChange={(e) => setDemolitionStart(e.target.value)}
                                            className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:ring-2 focus:ring-red-500 focus:border-transparent"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-xs text-gray-600 mb-1">予定終了日</label>
                                        <input
                                            type="date"
                                            value={demolitionEnd}
                                            onChange={(e) => setDemolitionEnd(e.target.value)}
                                            className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:ring-2 focus:ring-red-500 focus:border-transparent"
                                        />
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* その他 */}
                        <div className="mb-4">
                            <label className="flex items-center mb-2">
                                <input
                                    type="checkbox"
                                    checked={selectedTypes.other}
                                    onChange={(e) =>
                                        setSelectedTypes({ ...selectedTypes, other: e.target.checked })
                                    }
                                    className="w-4 h-4 text-yellow-600 border-gray-300 rounded focus:ring-yellow-500"
                                />
                                <span className="ml-2 text-gray-700 font-medium">
                                    {CONSTRUCTION_TYPE_LABELS.other}
                                </span>
                            </label>
                            {selectedTypes.other && (
                                <div className="ml-6 grid grid-cols-2 gap-3">
                                    <div>
                                        <label className="block text-xs text-gray-600 mb-1">予定開始日</label>
                                        <input
                                            type="date"
                                            value={otherStart}
                                            onChange={(e) => setOtherStart(e.target.value)}
                                            className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:ring-2 focus:ring-yellow-500 focus:border-transparent"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-xs text-gray-600 mb-1">予定終了日</label>
                                        <input
                                            type="date"
                                            value={otherEnd}
                                            onChange={(e) => setOtherEnd(e.target.value)}
                                            className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:ring-2 focus:ring-yellow-500 focus:border-transparent"
                                        />
                                    </div>
                                </div>
                            )}
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
                        {initialData ? '更新' : '登録'}
                    </button>
                </div>
            </div>
        </div>
    );
}
