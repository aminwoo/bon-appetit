'use client'

import {
  createContext,
  startTransition,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react'

type Language = 'en' | 'zh'

type TranslationKey =
  | 'plan'
  | 'recipes'
  | 'groceries'
  | 'mainNavigation'
  | 'languageLabel'
  | 'chinese'
  | 'english'
  | 'previousWeek'
  | 'thisWeek'
  | 'nextWeek'
  | 'mealsPlanned'
  | 'proteinTotal'
  | 'yourWeeklyTable'
  | 'makeRoomForGoodFood'
  | 'shapeTheWeek'
  | 'mealPlan'
  | 'breakfast'
  | 'lunch'
  | 'dinner'
  | 'snack'
  | 'groceryRun'
  | 'backToPlan'
  | 'weekInOneBag'
  | 'alreadySorted'
  | 'shoppingProgress'
  | 'itemsCollected'
  | 'include'
  | 'clearChecks'
  | 'aisleByAisle'
  | 'thisWeeksList'
  | 'metricQuantities'
  | 'noMealsSelected'
  | 'chooseMealType'
  | 'yourCollection'
  | 'recipesWorthRepeating'
  | 'createOrAdapt'
  | 'addRecipe'
  | 'demoMode'
  | 'saveRecipesHint'
  | 'yourRecipe'
  | 'miseFavourite'
  | 'viewRecipe'
  | 'prepMinutes'
  | 'servings'
  | 'removeMeal'
  | 'decreaseServings'
  | 'increaseServings'
  | 'chooseRecipe'
  | 'selectRecipe'
  | 'cancel'
  | 'addMeal'
  | 'swipeWeek'
  | 'produce'
  | 'meat'
  | 'dairy'
  | 'pantry'
  | 'spices'
  | 'allRecipes'
  | 'customize'
  | 'weeknightFavourite'
  | 'total'
  | 'perServing'
  | 'cookingFor'
  | 'measuredFor'
  | 'totalNutrition'
  | 'method'
  | 'fromPrepToPlate'
  | 'cancelEdit'
  | 'editRecipe'
  | 'makeItYours'
  | 'newRecipe'
  | 'refineDetails'
  | 'addSomething'
  | 'nutritionHint'
  | 'recipePhotoUrl'
  | 'uploadImage'
  | 'uploading'
  | 'photoPreview'
  | 'description'
  | 'prepTime'
  | 'cookTime'
  | 'baseServings'
  | 'perServingHeading'
  | 'nutrition'
  | 'metricOnly'
  | 'ingredients'
  | 'add'
  | 'addStep'
  | 'removeIngredient'
  | 'removeStep'
  | 'saveChanges'
  | 'createRecipe'
  | 'saving'
  | 'title'
  | 'minutes'
  | 'calories'
  | 'protein'
  | 'carbs'
  | 'fats'
  | 'fiber'
  | 'inOrder'
  | 'quickImport'
  | 'recipeLink'
  | 'importRecipe'
  | 'importingRecipe'
  | 'importHint'
  | 'recipesSaved'
  | 'averageMinutes'
  | 'searchRecipes'
  | 'searchPlaceholder'
  | 'clearSearch'
  | 'filterByTime'
  | 'allTimes'
  | 'underThirty'
  | 'thirtyToSixty'
  | 'overSixty'
  | 'sortBy'
  | 'featured'
  | 'quickest'
  | 'alphabetical'
  | 'highestProtein'
  | 'recipesFound'
  | 'resetFilters'
  | 'noRecipesFound'
  | 'tryAnotherSearch'
  | 'momentsCaptured'
  | 'captureMeal'
  | 'photoMustBeImage'
  | 'photoTooLarge'
  | 'photoUploadFailed'
  | 'mealMoments'
  | 'momentsFromWeek'
  | 'captureHint'
  | 'noMealPhotos'
  | 'useCameraButtons'

const translations: Record<Language, Record<TranslationKey, string>> = {
  en: {
    plan: 'Plan',
    recipes: 'Recipes',
    groceries: 'Groceries',
    mainNavigation: 'Main navigation',
    languageLabel: 'Language',
    chinese: '中文',
    english: 'EN',
    previousWeek: 'Previous week',
    thisWeek: 'This week',
    nextWeek: 'Next week',
    mealsPlanned: 'meals planned',
    proteinTotal: 'protein total',
    yourWeeklyTable: 'Your weekly table',
    makeRoomForGoodFood: 'Make room for good food.',
    shapeTheWeek:
      'Shape the week, balance each day, then turn the whole plan into one clean shopping list.',
    mealPlan: 'Meal plan',
    breakfast: 'Breakfast',
    lunch: 'Lunch',
    dinner: 'Dinner',
    snack: 'Snack',
    groceryRun: 'The grocery run,',
    backToPlan: 'Back to plan',
    weekInOneBag: 'Week in one bag',
    alreadySorted: 'already sorted.',
    shoppingProgress: 'Shopping progress',
    itemsCollected: 'items collected',
    include: 'Include',
    clearChecks: 'Clear checks',
    aisleByAisle: 'Aisle by aisle',
    thisWeeksList: "This week's list",
    metricQuantities: 'All quantities combine automatically in grams.',
    noMealsSelected: 'No meals selected',
    chooseMealType: 'Choose at least one meal type above.',
    yourCollection: 'Your collection',
    recipesWorthRepeating: 'Recipes worth repeating.',
    createOrAdapt:
      'Create your own recipes or adapt one of the built-in favourites.',
    addRecipe: 'Add recipe',
    demoMode: 'Demo mode.',
    saveRecipesHint: 'Add DATABASE_URL to save new recipes and edits.',
    yourRecipe: 'Your recipe',
    miseFavourite: 'Mise favourite',
    viewRecipe: 'View',
    prepMinutes: 'min',
    servings: 'servings',
    removeMeal: 'Remove meal',
    decreaseServings: 'Decrease servings',
    increaseServings: 'Increase servings',
    chooseRecipe: 'Choose recipe',
    selectRecipe: 'Select…',
    cancel: 'Cancel',
    addMeal: 'Add',
    swipeWeek: 'Swipe sideways to see the full week.',
    produce: 'Produce',
    meat: 'Meat',
    dairy: 'Dairy',
    pantry: 'Pantry',
    spices: 'Spices',
    allRecipes: 'All recipes',
    customize: 'Customize',
    weeknightFavourite: 'Weeknight favourite',
    total: 'total',
    perServing: 'per serving',
    cookingFor: 'Cooking for how many?',
    measuredFor: 'Measured for',
    totalNutrition: 'Total nutrition for',
    method: 'Method',
    fromPrepToPlate: 'From prep to plate',
    cancelEdit: 'Cancel',
    editRecipe: 'Edit recipe',
    makeItYours: 'Make it yours',
    newRecipe: 'New recipe',
    refineDetails: 'Refine the details.',
    addSomething: 'Add something delicious.',
    nutritionHint:
      'Quantities stay strictly metric. Nutrition values are recorded per serving.',
    recipePhotoUrl: 'Recipe photo URL',
    uploadImage: 'Upload image',
    uploading: 'Uploading…',
    photoPreview: 'Recipe photo preview',
    description: 'Description',
    prepTime: 'Prep time',
    cookTime: 'Cook time',
    baseServings: 'Base servings',
    perServingHeading: 'Per serving',
    nutrition: 'Nutrition',
    metricOnly: 'Grams only',
    ingredients: 'Ingredients',
    add: 'Add',
    addStep: 'Add step',
    removeIngredient: 'Remove ingredient',
    removeStep: 'Remove step',
    saveChanges: 'Save changes',
    createRecipe: 'Create recipe',
    saving: 'Saving…',
    title: 'Title',
    minutes: 'min',
    calories: 'Calories',
    protein: 'Protein',
    carbs: 'Carbs',
    fats: 'Fats',
    fiber: 'Fiber',
    inOrder: 'In order',
    quickImport: 'Quick import',
    recipeLink: 'Recipe link',
    importRecipe: 'Import recipe',
    importingRecipe: 'Importing…',
    importHint:
      'Paste a recipe page link. Imported quantities are metric estimates, so review them before saving.',
    recipesSaved: 'recipes saved',
    averageMinutes: 'avg. minutes',
    searchRecipes: 'Search recipes',
    searchPlaceholder: 'Search your collection…',
    clearSearch: 'Clear search',
    filterByTime: 'Filter by cooking time',
    allTimes: 'All',
    underThirty: '≤ 30 min',
    thirtyToSixty: '30–60 min',
    overSixty: '60+ min',
    sortBy: 'Sort',
    featured: 'Featured',
    quickest: 'Quickest',
    alphabetical: 'A–Z',
    highestProtein: 'Most protein',
    recipesFound: 'recipes found',
    resetFilters: 'Reset filters',
    noRecipesFound: 'Nothing on the menu yet.',
    tryAnotherSearch: 'Try another search or remove a time filter.',
    momentsCaptured: 'moments captured',
    captureMeal: 'Take a meal photo',
    photoMustBeImage: 'Choose an image to add to your meal journal.',
    photoTooLarge: 'Meal photos must be 10 MB or smaller.',
    photoUploadFailed: 'Could not add this meal photo.',
    mealMoments: 'Meal moments',
    momentsFromWeek: 'A week, in pictures.',
    captureHint:
      'Use the camera beside any meal slot—planned or spontaneous—to remember what you ate.',
    noMealPhotos: 'Your meal journal is ready.',
    useCameraButtons: 'Tap a camera beside any meal slot to add your first photo.',
  },
  zh: {
    plan: '计划',
    recipes: '食谱',
    groceries: '杂货清单',
    mainNavigation: '主导航',
    languageLabel: '语言',
    chinese: '中文',
    english: 'EN',
    previousWeek: '上一周',
    thisWeek: '本周',
    nextWeek: '下一周',
    mealsPlanned: '餐已计划',
    proteinTotal: '蛋白质总量',
    yourWeeklyTable: '你的每周餐桌',
    makeRoomForGoodFood: '为好食物留出空间。',
    shapeTheWeek:
      '安排一周菜单，平衡每一天，再把整份计划变成一张清晰的购物清单。',
    mealPlan: '用餐计划',
    breakfast: '早餐',
    lunch: '午餐',
    dinner: '晚餐',
    snack: '加餐',
    groceryRun: '购物清单，',
    backToPlan: '返回计划',
    weekInOneBag: '一周尽在一袋',
    alreadySorted: '已经整理好了。',
    shoppingProgress: '购物进度',
    itemsCollected: '项已购买',
    include: '包含',
    clearChecks: '清除勾选',
    aisleByAisle: '按货架分类',
    thisWeeksList: '本周清单',
    metricQuantities: '所有数量都会自动换算为克并合并。',
    noMealsSelected: '尚未选择餐食',
    chooseMealType: '请至少选择上方的一种餐食类型。',
    yourCollection: '你的收藏',
    recipesWorthRepeating: '值得反复制作的食谱。',
    createOrAdapt: '创建自己的食谱，或改编内置的精选食谱。',
    addRecipe: '添加食谱',
    demoMode: '演示模式。',
    saveRecipesHint: '添加 DATABASE_URL 后即可保存新食谱和编辑内容。',
    yourRecipe: '你的食谱',
    miseFavourite: 'Mise 精选',
    viewRecipe: '查看',
    prepMinutes: '分钟',
    servings: '份',
    removeMeal: '移除餐食',
    decreaseServings: '减少份数',
    increaseServings: '增加份数',
    chooseRecipe: '选择食谱',
    selectRecipe: '选择…',
    cancel: '取消',
    addMeal: '添加',
    swipeWeek: '向左滑动查看完整的一周。',
    produce: '蔬果',
    meat: '肉类',
    dairy: '乳制品',
    pantry: '主食杂货',
    spices: '香料',
    allRecipes: '全部食谱',
    customize: '定制',
    weeknightFavourite: '工作日晚餐精选',
    total: '总计',
    perServing: '每份',
    cookingFor: '准备几人份？',
    measuredFor: '当前份数',
    totalNutrition: '总营养值，份数为',
    method: '做法',
    fromPrepToPlate: '从准备到装盘',
    cancelEdit: '取消',
    editRecipe: '编辑食谱',
    makeItYours: '定制你的版本',
    newRecipe: '新食谱',
    refineDetails: '完善细节。',
    addSomething: '添加一道美味。',
    nutritionHint: '数量统一使用公制单位，营养值按每份记录。',
    recipePhotoUrl: '食谱照片 URL',
    uploadImage: '上传图片',
    uploading: '上传中…',
    photoPreview: '食谱照片预览',
    description: '描述',
    prepTime: '准备时间',
    cookTime: '烹饪时间',
    baseServings: '基础份数',
    perServingHeading: '每份营养',
    nutrition: '营养',
    metricOnly: '仅使用克',
    ingredients: '食材',
    add: '添加',
    addStep: '添加步骤',
    removeIngredient: '移除食材',
    removeStep: '移除步骤',
    saveChanges: '保存更改',
    createRecipe: '创建食谱',
    saving: '保存中…',
    title: '标题',
    minutes: '分钟',
    calories: '热量',
    protein: '蛋白质',
    carbs: '碳水',
    fats: '脂肪',
    fiber: '纤维',
    inOrder: '按顺序',
    quickImport: '快速导入',
    recipeLink: '食谱链接',
    importRecipe: '导入食谱',
    importingRecipe: '导入中…',
    importHint: '粘贴食谱页面链接。导入的数量为公制估算值，请在保存前检查。',
    recipesSaved: '份食谱',
    averageMinutes: '平均分钟',
    searchRecipes: '搜索食谱',
    searchPlaceholder: '搜索食谱或食材…',
    clearSearch: '清除搜索',
    filterByTime: '按烹饪时间筛选',
    allTimes: '全部',
    underThirty: '≤ 30 分钟',
    thirtyToSixty: '30–60 分钟',
    overSixty: '60+ 分钟',
    sortBy: '排序',
    featured: '精选',
    quickest: '最快',
    alphabetical: '名称',
    highestProtein: '蛋白质最高',
    recipesFound: '份食谱',
    resetFilters: '重置筛选',
    noRecipesFound: '暂时没有符合的食谱。',
    tryAnotherSearch: '试试其他关键词或移除时间筛选。',
    momentsCaptured: '个用餐瞬间',
    captureMeal: '拍摄餐食照片',
    photoMustBeImage: '请选择图片添加到用餐记录。',
    photoTooLarge: '餐食照片不得超过 10 MB。',
    photoUploadFailed: '无法添加这张餐食照片。',
    mealMoments: '用餐瞬间',
    momentsFromWeek: '用照片记录这一周。',
    captureHint: '点击任意餐食时段旁的相机，记录计划内或临时享用的餐食。',
    noMealPhotos: '你的用餐相册已准备好。',
    useCameraButtons: '点击任意餐食时段旁的相机添加第一张照片。',
  },
}

type LanguageContextValue = {
  language: Language
  setLanguage: (language: Language) => void
  t: (key: TranslationKey) => string
}

const LanguageContext = createContext<LanguageContextValue | null>(null)

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [language, setLanguageState] = useState<Language>('en')

  useEffect(() => {
    const storedLanguage = window.localStorage.getItem('mise-language')
    if (storedLanguage === 'en' || storedLanguage === 'zh') {
      startTransition(() => setLanguageState(storedLanguage))
    }
  }, [])

  useEffect(() => {
    document.documentElement.lang = language === 'zh' ? 'zh-CN' : 'en'
  }, [language])

  function setLanguage(nextLanguage: Language) {
    setLanguageState(nextLanguage)
    window.localStorage.setItem('mise-language', nextLanguage)
  }

  const value = useMemo(
    () => ({
      language,
      setLanguage,
      t: (key: TranslationKey) => translations[language][key],
    }),
    [language],
  )

  return (
    <LanguageContext.Provider value={value}>
      {children}
    </LanguageContext.Provider>
  )
}

export function useLanguage() {
  const context = useContext(LanguageContext)
  if (!context)
    throw new Error('useLanguage must be used inside LanguageProvider')
  return context
}
