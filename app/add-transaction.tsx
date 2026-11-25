import { Category } from '@/api/endpoints/categories';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { ThemedText } from '@/components/ui/themed-text';
import { ThemedView } from '@/components/ui/themed-view';
import { brand, Colors, zinc } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { useAppCurrency } from '@/hooks/useAppCurrency';
import { useBudgets } from '@/hooks/useBudgets';
import { useCategories } from '@/hooks/useCategories';
import { useCreateTransaction } from '@/hooks/useTransactions';
import { useRouter } from 'expo-router';
import { useEffect, useRef, useState } from 'react';
import {
    ActivityIndicator,
    Alert,
    Keyboard,
    Platform,
    ScrollView,
    TextInput,
    TouchableOpacity,
    View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export default function AddTransactionScreen() {
    const router = useRouter();
    const insets = useSafeAreaInsets();
    const colorScheme = useColorScheme();
    const isDark = colorScheme === 'dark';
    const c = Colors[isDark ? 'dark' : 'light'];
    const { symbol } = useAppCurrency();
    const currencySymbol = symbol || '₹';

    const scrollViewRef = useRef<any>(null);
    const [keyboardHeight, setKeyboardHeight] = useState(0);

    const [type, setType] = useState<'expense' | 'income'>('expense');
    const [amount, setAmount] = useState('');
    const [description, setDescription] = useState('');
    const [categoryId, setCategoryId] = useState('');
    const [budgetId, setBudgetId] = useState<string | null>(null);

    const { data: categories = [], isLoading: categoriesLoading } = useCategories();
    const { data: budgets = [] } = useBudgets();
    const createTransaction = useCreateTransaction();

    const filteredCategories = categories.filter((cat: Category) => cat.type === type);

    // Track keyboard show & hide events accurately on both Android and iOS
    useEffect(() => {
        const showEvent = Platform.OS === 'ios' ? 'keyboardWillShow' : 'keyboardDidShow';
        const hideEvent = Platform.OS === 'ios' ? 'keyboardWillHide' : 'keyboardDidHide';

        const showSubscription = Keyboard.addListener(showEvent, (e) => {
            setKeyboardHeight(e.endCoordinates.height);
        });
        const hideSubscription = Keyboard.addListener(hideEvent, () => {
            setKeyboardHeight(0);
        });

        return () => {
            showSubscription.remove();
            hideSubscription.remove();
        };
    }, []);

    // Smoothly scroll down so the description input is positioned above the keyboard
    const scrollToBottom = () => {
        setTimeout(() => {
            scrollViewRef.current?.scrollToEnd({ animated: true });
        }, 120);
    };

    const handleSubmit = async () => {
        const numAmount = parseFloat(amount.trim());
        if (isNaN(numAmount) || numAmount <= 0) {
            Alert.alert('Invalid Amount', 'Please enter a valid transaction amount.');
            return;
        }

        if (!categoryId) {
            Alert.alert('Category Required', 'Please select a category.');
            return;
        }

        try {
            await createTransaction.mutateAsync({
                categoryId,
                budgetId: type === 'expense' && budgetId ? budgetId : undefined,
                type,
                amount: numAmount,
                description: description.trim() || undefined,
                date: new Date().toISOString(),
            });
            router.back();
        } catch (err: any) {
            const msg = err?.response?.data?.message || err?.message || 'Failed to create transaction.';
            Alert.alert('Error', msg);
        }
    };

    return (
        <ThemedView className="flex-1" style={{ paddingTop: insets.top }}>
            {/* Header */}
            <View className="flex-row items-center justify-between px-5 py-4 border-b border-zinc-200 dark:border-zinc-800">
                <TouchableOpacity
                    hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                    onPress={() => router.back()}
                >
                    <IconSymbol name="xmark" size={22} color={c.icon} />
                </TouchableOpacity>
                <ThemedText type="defaultSemiBold" className="text-lg">
                    Add Transaction
                </ThemedText>
                <View style={{ width: 22 }} />
            </View>

            <ScrollView
                ref={scrollViewRef}
                showsVerticalScrollIndicator={false}
                keyboardShouldPersistTaps="handled"
                keyboardDismissMode="on-drag"
                contentContainerStyle={{
                    padding: 20,
                    // Dynamic padding: expands by the exact keyboard height when open
                    paddingBottom: keyboardHeight > 0 ? keyboardHeight + 30 : Math.max(insets.bottom, 24) + 40,
                }}
            >
                {/* Type Toggle: Expense / Income */}
                <View className="flex-row bg-zinc-100 dark:bg-zinc-800 rounded-2xl p-1 mb-6">
                    <TouchableOpacity
                        onPress={() => {
                            setType('expense');
                            setCategoryId('');
                        }}
                        style={{
                            flex: 1,
                            paddingVertical: 10,
                            alignItems: 'center',
                            borderRadius: 12,
                            backgroundColor: type === 'expense' ? c.primary : 'transparent',
                        }}
                    >
                        <ThemedText
                            style={{
                                fontWeight: '600',
                                color: type === 'expense' ? c.primaryForeground : zinc[500],
                            }}
                        >
                            Expense
                        </ThemedText>
                    </TouchableOpacity>

                    <TouchableOpacity
                        onPress={() => {
                            setType('income');
                            setCategoryId('');
                            setBudgetId(null);
                        }}
                        style={{
                            flex: 1,
                            paddingVertical: 10,
                            alignItems: 'center',
                            borderRadius: 12,
                            backgroundColor: type === 'income' ? c.primary : 'transparent',
                        }}
                    >
                        <ThemedText
                            style={{
                                fontWeight: '600',
                                color: type === 'income' ? c.primaryForeground : zinc[500],
                            }}
                        >
                            Income
                        </ThemedText>
                    </TouchableOpacity>
                </View>

                {/* Amount Input */}
                <View className="mb-6 items-center">
                    <ThemedText className="text-xs text-zinc-400 uppercase tracking-widest mb-1">
                        Amount
                    </ThemedText>
                    <View className="flex-row items-center justify-center">
                        <ThemedText className="text-3xl font-bold mr-1 text-zinc-500">
                            {currencySymbol}
                        </ThemedText>
                        <TextInput
                            value={amount}
                            onChangeText={setAmount}
                            placeholder="0.00"
                            placeholderTextColor={isDark ? zinc[600] : zinc[300]}
                            keyboardType="decimal-pad"
                            autoFocus
                            style={{
                                fontSize: 38,
                                fontWeight: '700',
                                color: isDark ? '#FFFFFF' : '#18181B',
                                minWidth: 120,
                                textAlign: 'center',
                            }}
                        />
                    </View>
                </View>

                {/* Category Selection */}
                <View className="mb-6">
                    <ThemedText className="text-xs text-zinc-400 uppercase tracking-widest mb-3">
                        Category
                    </ThemedText>
                    {categoriesLoading ? (
                        <ActivityIndicator size="small" />
                    ) : filteredCategories.length === 0 ? (
                        <ThemedText className="text-sm text-zinc-400">
                            No categories available for {type}. Create one first.
                        </ThemedText>
                    ) : (
                        <View className="flex-row flex-wrap gap-2">
                            {filteredCategories.map((cat: Category) => {
                                const isSelected = categoryId === cat.id;
                                return (
                                    <TouchableOpacity
                                        key={cat.id}
                                        onPress={() => setCategoryId(cat.id)}
                                        style={{
                                            flexDirection: 'row',
                                            alignItems: 'center',
                                            gap: 6,
                                            paddingHorizontal: 14,
                                            paddingVertical: 10,
                                            borderRadius: 16,
                                            borderWidth: 1.5,
                                            borderColor: isSelected ? cat.color || brand[500] : isDark ? zinc[800] : zinc[200],
                                            backgroundColor: isSelected
                                                ? isDark ? zinc[800] : zinc[100]
                                                : 'transparent',
                                        }}
                                    >
                                        <View
                                            style={{
                                                width: 10,
                                                height: 10,
                                                borderRadius: 5,
                                                backgroundColor: cat.color || brand[500],
                                            }}
                                        />
                                        <ThemedText className="text-sm font-medium">
                                            {cat.name}
                                        </ThemedText>
                                    </TouchableOpacity>
                                );
                            })}
                        </View>
                    )}
                </View>

                {/* Budget Selection (Optional for Expenses) */}
                {type === 'expense' && budgets.length > 0 && (
                    <View className="mb-6">
                        <ThemedText className="text-xs text-zinc-400 uppercase tracking-widest mb-3">
                            Link to Budget (Optional)
                        </ThemedText>
                        <ScrollView horizontal showsHorizontalScrollIndicator={false} className="flex-row gap-2">
                            <TouchableOpacity
                                onPress={() => setBudgetId(null)}
                                style={{
                                    paddingHorizontal: 14,
                                    paddingVertical: 8,
                                    borderRadius: 14,
                                    borderWidth: 1,
                                    borderColor: budgetId === null ? brand[500] : isDark ? zinc[800] : zinc[200],
                                    backgroundColor: budgetId === null ? (isDark ? zinc[800] : zinc[100]) : 'transparent',
                                }}
                            >
                                <ThemedText className="text-sm font-medium">None</ThemedText>
                            </TouchableOpacity>
                            {budgets.map((b: any) => {
                                const isSelected = budgetId === b.id;
                                return (
                                    <TouchableOpacity
                                        key={b.id}
                                        onPress={() => setBudgetId(b.id)}
                                        style={{
                                            paddingHorizontal: 14,
                                            paddingVertical: 8,
                                            borderRadius: 14,
                                            borderWidth: 1,
                                            borderColor: isSelected ? brand[500] : isDark ? zinc[800] : zinc[200],
                                            backgroundColor: isSelected ? (isDark ? zinc[800] : zinc[100]) : 'transparent',
                                        }}
                                    >
                                        <ThemedText className="text-sm font-medium">{b.name}</ThemedText>
                                    </TouchableOpacity>
                                );
                            })}
                        </ScrollView>
                    </View>
                )}

                {/* Description Input */}
                <View className="mb-8">
                    <ThemedText className="text-xs text-zinc-400 uppercase tracking-widest mb-2">
                        Note / Description
                    </ThemedText>
                    <TextInput
                        value={description}
                        onChangeText={setDescription}
                        onFocus={scrollToBottom}
                        placeholder="e.g. Grocery run, coffee, salary..."
                        placeholderTextColor={isDark ? zinc[600] : zinc[400]}
                        style={{
                            borderWidth: 1,
                            borderColor: isDark ? zinc[800] : zinc[200],
                            backgroundColor: isDark ? zinc[900] : zinc[50],
                            borderRadius: 16,
                            padding: 14,
                            color: isDark ? '#FFFFFF' : '#18181B',
                            fontSize: 15,
                        }}
                    />
                </View>

                {/* Submit Button */}
                <TouchableOpacity
                    onPress={handleSubmit}
                    disabled={createTransaction.isPending}
                    style={{
                        backgroundColor: c.primary,
                        paddingVertical: 16,
                        borderRadius: 20,
                        alignItems: 'center',
                        justifyContent: 'center',
                    }}
                >
                    {createTransaction.isPending ? (
                        <ActivityIndicator color={c.primaryForeground} />
                    ) : (
                        <ThemedText
                            style={{
                                color: c.primaryForeground,
                                fontWeight: '700',
                                fontSize: 16,
                            }}
                        >
                            Save Transaction
                        </ThemedText>
                    )}
                </TouchableOpacity>
            </ScrollView>
        </ThemedView>
    );
}