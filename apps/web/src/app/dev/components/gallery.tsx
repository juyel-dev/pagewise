"use client";

import { BookOpen, Star } from "lucide-react";
import { useState, type ReactNode } from "react";
import { ThemeToggle } from "@/components/theme-toggle";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge, Chip } from "@/components/ui/chip";
import { Dialog } from "@/components/ui/dialog";
import { EmptyState } from "@/components/ui/empty-state";
import { Checkbox, SelectField, Switch, TextareaField, TextField } from "@/components/ui/field";
import { IconButton } from "@/components/ui/icon-button";
import { KeyHint } from "@/components/ui/key-hint";
import { ProgressBar, ProgressRing } from "@/components/ui/progress";
import { SegmentedControl } from "@/components/ui/segmented-control";
import { Sheet } from "@/components/ui/sheet";
import { Skeleton, SkeletonGroup } from "@/components/ui/skeleton";
import { Tabs } from "@/components/ui/tabs";
import { useToast } from "@/components/ui/toast";
import { Tooltip } from "@/components/ui/tooltip";

const swatches = ["canvas", "surface", "surface-2", "line", "field", "ink", "ink-2", "muted", "brand", "brand-soft", "brand-text", "accent", "accent-soft", "accent-text", "good", "good-soft", "bad", "bad-soft"];
const roles = [["Display", "text-display"], ["H1", "text-h1"], ["H2", "text-h2"], ["H3", "text-h3"], ["Lede", "text-lede"], ["Body", "text-body"], ["Question", "text-question"], ["Label", "text-label"], ["Small", "text-small"], ["Caption", "text-caption"]] as const;

function Section({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section className="flex flex-col gap-4 border-t border-line pt-8">
      <h2 className="text-h2">{title}</h2>
      {children}
    </section>
  );
}

export function Gallery() {
  const [view, setView] = useState<"focus" | "list">("focus");
  const [on, setOn] = useState(true);
  const [chip, setChip] = useState(true);
  const [dialog, setDialog] = useState(false);
  const [sheet, setSheet] = useState(false);
  const { toast } = useToast();

  return (
    <main id="main" className="mx-auto flex max-w-5xl flex-col gap-10 px-5 py-10 sm:px-8">
      <header className="flex items-center gap-4">
        <div className="flex-1">
          <h1 className="text-h1">Design system</h1>
          <p className="text-small text-ink-2">Every component, every state. Switch theme to check both.</p>
        </div>
        <ThemeToggle />
      </header>

      <Section title="Type roles">
        <div className="flex flex-col gap-3">
          {roles.map(([name, cls]) => <p key={name} className={cls}><span className="text-caption text-muted mr-3">{name}</span>Read the NCERT page. Practise its questions.</p>)}
        </div>
      </Section>

      <Section title="Colour tokens">
        <ul className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
          {swatches.map((s) => (
            <li key={s} className="flex flex-col gap-1">
              <span className="h-12 rounded-lg border border-line" style={{ background: `var(--${s})` }} />
              <span className="text-caption text-ink-2">{s}</span>
            </li>
          ))}
        </ul>
      </Section>

      <Section title="Buttons">
        <div className="flex flex-wrap items-center gap-3">
          <Button>Primary</Button><Button variant="secondary">Secondary</Button><Button variant="ghost">Ghost</Button><Button variant="danger">Danger</Button>
          <Button size="sm">Small</Button><Button size="lg">Large</Button>
          <Button loading>Saving</Button><Button disabled>Disabled</Button>
          <Button leadingIcon={<BookOpen className="size-4" aria-hidden="true" />}>With icon</Button>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <Tooltip label="Save question"><IconButton label="Save question"><Star className="size-5" aria-hidden="true" /></IconButton></Tooltip>
          <IconButton label="Save" variant="secondary"><Star className="size-5" aria-hidden="true" /></IconButton>
        </div>
      </Section>

      <Section title="Chips, badges, keys">
        <div className="flex flex-wrap items-center gap-2">
          <Chip selected={chip} count={4} onClick={() => setChip((v) => !v)}>p.4</Chip><Chip count={3}>p.6</Chip>
          <Badge tone="good">Live</Badge><Badge tone="accent">Coming soon</Badge><Badge tone="bad">Missed</Badge><Badge tone="brand">Selected</Badge><Badge>Neutral</Badge>
          <KeyHint>N</KeyHint><KeyHint>Enter</KeyHint>
        </div>
      </Section>

      <Section title="Segmented control and tabs">
        <SegmentedControl label="Question view" value={view} onChange={setView} options={[{ value: "focus", label: "Focus" }, { value: "list", label: "List" }]} />
        <Tabs label="Study panels" fill tabs={[{ id: "read", label: "Read", panel: <p className="p-4 text-body">PDF goes here.</p> }, { id: "practise", label: "Practise", panel: <p className="p-4 text-body">Questions go here.</p> }]} defaultValue="practise" />
      </Section>

      <Section title="Fields">
        <div className="grid gap-4 sm:grid-cols-2">
          <TextField label="Your name" helper="As you want it shown" placeholder="Juyel" />
          <TextField label="Email" error="Enter a valid email address" defaultValue="juyel@" />
          <SelectField label="Class"><option>Class 11</option><option>Class 12</option></SelectField>
          <TextareaField label="Message" helper="1000 characters at most" />
          <Checkbox label="Remember me" />
          <Switch label="Follow my reading" checked={on} onCheckedChange={setOn} />
        </div>
      </Section>

      <Section title="Progress and loading">
        <div className="flex flex-wrap items-center gap-8">
          <ProgressRing value={12} max={20} label="12 of 20 questions today"><span className="text-h2 tabular-nums">12 / 20</span></ProgressRing>
          <div className="flex w-64 flex-col gap-3">
            <ProgressBar value={3} max={9} label="Pages read" /><ProgressBar value={35} label="Accuracy" tone="bad" /><ProgressBar value={60} label="Accuracy" tone="accent" />
          </div>
          <SkeletonGroup className="flex w-64 flex-col gap-2"><Skeleton className="h-5 w-1/2" /><Skeleton className="h-4" /><Skeleton className="h-24" /></SkeletonGroup>
        </div>
      </Section>

      <Section title="Cards and empty state">
        <div className="grid gap-4 sm:grid-cols-3">
          <Card>Flat</Card><Card variant="raised">Raised</Card><Card variant="interactive">Interactive</Card>
        </div>
        <Card><EmptyState icon={<Star />} title="No saved questions yet" action={<Button variant="secondary">Go to Study</Button>}>Tap the star on any question to keep it here.</EmptyState></Card>
      </Section>

      <Section title="Overlays">
        <div className="flex flex-wrap gap-3">
          <Button variant="secondary" onClick={() => setDialog(true)}>Open dialog</Button>
          <Button variant="secondary" onClick={() => setSheet(true)}>Open sheet</Button>
          <Button variant="secondary" onClick={() => toast({ title: "Saved", tone: "success" })}>Toast: success</Button>
          <Button variant="secondary" onClick={() => toast({ title: "Your answer couldn't be saved yet", description: "We'll keep trying.", tone: "error" })}>Toast: error</Button>
          <Button variant="secondary" onClick={() => toast({ title: "Removed from saved", action: { label: "Undo", onClick: () => {} } })}>Toast: with action</Button>
        </div>
        <Dialog open={dialog} onClose={() => setDialog(false)} title="Delete your account?" description="This removes your progress and bookmarks. It cannot be undone." footer={<><Button variant="primary" onClick={() => setDialog(false)}>Keep my account</Button><Button variant="danger" onClick={() => setDialog(false)}>Delete account</Button></>} />
        <Sheet open={sheet} onClose={() => setSheet(false)} title="More"><p className="text-body">Bookmarks, Help, Settings…</p></Sheet>
      </Section>
    </main>
  );
}
