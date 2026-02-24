'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'sonner';
import ProgressBar from '@/components/animations/ProgressBar';

interface StepConfig {
  title: string;
  subtitle: string;
  field: string;
  type: 'single' | 'multi';
  options: { value: string; label: string; icon: string }[];
}

const steps: StepConfig[] = [
  {
    title: 'How old are you?',
    subtitle: 'This helps us find the best offers for you',
    field: 'ageRange',
    type: 'single',
    options: [
      { value: '18-24', label: '18-24', icon: '🧑' },
      { value: '25-34', label: '25-34', icon: '👨' },
      { value: '35-44', label: '35-44', icon: '🧔' },
      { value: '45-54', label: '45-54', icon: '👨‍🦳' },
      { value: '55+', label: '55+', icon: '👴' },
    ],
  },
  {
    title: "What's your gender?",
    subtitle: 'Used for offer matching',
    field: 'gender',
    type: 'single',
    options: [
      { value: 'male', label: 'Male', icon: '♂️' },
      { value: 'female', label: 'Female', icon: '♀️' },
    ],
  },
  {
    title: 'How much time can you play per day?',
    subtitle: "We'll match you with the right offers",
    field: 'timeAvailable',
    type: 'single',
    options: [
      { value: '<1hr', label: 'Less than 1 hour', icon: '⏰' },
      { value: '1-2hr', label: '1-2 hours', icon: '🕐' },
      { value: '2-4hr', label: '2-4 hours', icon: '🕑' },
      { value: '4+hr', label: '4+ hours', icon: '🕓' },
    ],
  },
];

export default function SurveyPage() {
  const router = useRouter();
  const { data: session, status } = useSession();
  const [currentStep, setCurrentStep] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string | string[]>>({});
  const [loading, setLoading] = useState(false);

  // If onboarding is already done (stale JWT brought user here), redirect out
  useEffect(() => {
    if (status === 'authenticated' && session?.user?.onboardingDone) {
      router.replace('/earn');
    }
  }, [status, session, router]);

  const step = steps[currentStep];
  const isLastStep = currentStep === steps.length - 1;

  if (!step) return null;

  function selectOption(value: string) {
    if (step.type === 'single') {
      setAnswers((prev) => ({ ...prev, [step.field]: value }));
      // Auto-advance after a short delay for satisfying UX
      setTimeout(() => {
        if (isLastStep) {
          submitSurvey({ ...answers, [step.field]: value });
        } else {
          setCurrentStep((s) => s + 1);
        }
      }, 300);
    } else {
      // Multi-select toggle
      setAnswers((prev) => {
        const current = (prev[step.field] as string[]) || [];
        if (current.includes(value)) {
          return { ...prev, [step.field]: current.filter((v) => v !== value) };
        }
        return { ...prev, [step.field]: [...current, value] };
      });
    }
  }

  function handleMultiNext() {
    if (isLastStep) {
      submitSurvey(answers);
    } else {
      setCurrentStep((s) => s + 1);
    }
  }

  async function submitSurvey(finalAnswers: Record<string, string | string[]>) {
    setLoading(true);
    try {
      const res = await fetch('/api/survey', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(finalAnswers),
      });
      if (res.ok || res.status === 409) {
        // 409 = already completed — still navigate forward
        router.push('/welcome');
      } else {
        const data = await res.json().catch(() => ({ error: 'Something went wrong' }));
        toast.error(data.error || 'Failed to save survey');
      }
    } finally {
      setLoading(false);
    }
  }

  function isSelected(value: string): boolean {
    const answer = answers[step.field];
    if (Array.isArray(answer)) return answer.includes(value);
    return answer === value;
  }

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
      <ProgressBar current={currentStep + 1} total={steps.length} className="mb-8" />

      <AnimatePresence mode="wait">
        <motion.div
          key={currentStep}
          initial={{ opacity: 0, x: 30 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -30 }}
          transition={{ duration: 0.25 }}
        >
          <div className="text-center mb-8">
            <h1 className="text-2xl font-bold text-white mb-2">{step.title}</h1>
            <p className="text-[#a9a9ca]">{step.subtitle}</p>
          </div>

          <div className={`grid gap-4 ${step.options.length > 4 ? 'grid-cols-2' : 'grid-cols-1'}`}>
            {step.options.map((opt) => (
              <button
                key={opt.value}
                onClick={() => selectOption(opt.value)}
                disabled={loading}
                className={`flex items-center gap-4 p-5 rounded-[20px] border transition text-left card-shadow ${
                  isSelected(opt.value)
                    ? 'border-[#01d676] bg-[#01d676]/10 text-white'
                    : 'border-[#393e56] bg-[#1d1d2e] text-white hover:border-[#01d676]/50'
                }`}
              >
                <span className="text-2xl">{opt.icon}</span>
                <span className="font-medium">{opt.label}</span>
                {isSelected(opt.value) && (
                  <motion.span
                    className="ml-auto text-[#01d676]"
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                  >
                    ✓
                  </motion.span>
                )}
              </button>
            ))}
          </div>

          {step.type === 'multi' && (
            <button
              onClick={handleMultiNext}
              disabled={loading || !((answers[step.field] as string[])?.length > 0)}
              className="w-full mt-6 py-4 rounded-xl bg-[#01d676] hover:bg-[#01ff97] text-black font-semibold transition disabled:opacity-50 glow-green-cta"
            >
              {loading ? 'Saving...' : isLastStep ? 'Finish & Claim Bonus' : 'Continue'}
            </button>
          )}

          {currentStep > 0 && (
            <button
              onClick={() => setCurrentStep((s) => s - 1)}
              className="w-full mt-3 py-3 rounded-xl text-[#787ead] hover:text-white transition text-sm"
            >
              ← Back
            </button>
          )}
        </motion.div>
      </AnimatePresence>
    </motion.div>
  );
}
