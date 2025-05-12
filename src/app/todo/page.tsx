
"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Icons } from "@/components/icons";
import { useToast } from "@/hooks/use-toast";
import { Toaster } from "@/components/ui/toaster";
import { format } from "date-fns";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";

type Todo = {
  id: string;
  text: string;
  isCompleted: boolean;
  createdAt: Date;
  completedAt?: Date;
};

export default function TodoPage() {
  const [todos, setTodos] = useState<Todo[]>([]);
  const [newTodoText, setNewTodoText] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    if (typeof window !== "undefined") {
      const storedDarkMode = localStorage.getItem("darkMode");
      if (storedDarkMode === "false") {
        document.documentElement.classList.remove("dark");
      } else {
        document.documentElement.classList.add("dark");
      }

      const storedTodos = localStorage.getItem("pocketLedgerTodos");
      if (storedTodos) {
        try {
          setTodos(
            JSON.parse(storedTodos).map((todo: any) => ({
              ...todo,
              createdAt: new Date(todo.createdAt),
              completedAt: todo.completedAt ? new Date(todo.completedAt) : undefined,
            }))
          );
        } catch (error) {
          console.error("Failed to parse todos from localStorage:", error);
          setTodos([]);
        }
      }
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    if (typeof window !== "undefined" && !isLoading) {
      localStorage.setItem("pocketLedgerTodos", JSON.stringify(todos));
    }
  }, [todos, isLoading]);

  const handleAddTodo = () => {
    if (!newTodoText.trim()) {
      toast({
        title: "Error",
        description: "Please enter text for your task.",
        variant: "destructive",
      });
      return;
    }

    const newTodo: Todo = {
      id: Date.now().toString(),
      text: newTodoText.trim(),
      isCompleted: false,
      createdAt: new Date(),
    };

    setTodos((prevTodos) => [newTodo, ...prevTodos]);
    setNewTodoText("");
    toast({
      title: "Task Added",
      description: "Your new task has been added.",
    });
  };

  const toggleTodoComplete = (id: string) => {
    setTodos((prevTodos) =>
      prevTodos.map((todo) =>
        todo.id === id
          ? { ...todo, isCompleted: !todo.isCompleted, completedAt: !todo.isCompleted ? new Date() : undefined }
          : todo
      )
    );
  };

  const handleDeleteTodo = (id: string) => {
    setTodos((prevTodos) => prevTodos.filter((todo) => todo.id !== id));
    toast({
      title: "Task Deleted",
      description: "The task has been successfully deleted.",
      variant: "destructive",
    });
  };

  const ongoingTodos = useMemo(() => todos.filter(todo => !todo.isCompleted).sort((a,b) => b.createdAt.getTime() - a.createdAt.getTime()), [todos]);
  const completedTodos = useMemo(() => todos.filter(todo => todo.isCompleted).sort((a,b) => (b.completedAt?.getTime() || 0) - (a.completedAt?.getTime() || 0)), [todos]);

  if (isLoading) {
    return (
      <div className="container mx-auto p-4 sm:p-6 md:p-8 min-h-screen flex flex-col items-center justify-center bg-background/70 backdrop-blur-sm">
        <Icons.loader className="h-12 w-12 animate-spin text-primary" />
        <p className="mt-4 text-lg text-foreground">Loading tasks...</p>
      </div>
    );
  }

  const renderTodoList = (list: Todo[], type: 'ongoing' | 'completed') => (
    <ScrollArea className="h-[400px] pr-4">
        {list.length === 0 ? (
            <div className="text-center py-10">
                <Icons.clipboardList className="mx-auto h-12 w-12 text-muted-foreground mb-3" />
                <p className="text-lg font-medium text-card-foreground">No {type} tasks yet.</p>
                {type === 'ongoing' && <p className="text-sm text-muted-foreground">Add a new task using the form above.</p>}
            </div>
        ) : (
        <ul className="space-y-3">
            {list.map((todo) => (
            <li
                key={todo.id}
                className={cn(
                "flex items-center justify-between p-4 rounded-lg shadow-sm transition-all",
                todo.isCompleted ? "bg-muted/50 opacity-70" : "bg-card/90 hover:shadow-md"
                )}
            >
                <div className="flex items-center space-x-3">
                <Checkbox
                    id={`todo-${todo.id}`}
                    checked={todo.isCompleted}
                    onCheckedChange={() => toggleTodoComplete(todo.id)}
                    className="rounded-full h-5 w-5 border-primary data-[state=checked]:bg-primary data-[state=checked]:text-primary-foreground"
                    aria-label={todo.isCompleted ? `Mark "${todo.text}" as ongoing` : `Mark "${todo.text}" as completed`}
                />
                <label
                    htmlFor={`todo-${todo.id}`}
                    className={cn(
                    "flex-1 text-sm font-medium cursor-pointer",
                    todo.isCompleted ? "line-through text-muted-foreground" : "text-card-foreground"
                    )}
                >
                    {todo.text}
                </label>
                </div>
                <div className="flex items-center space-x-2">
                <span className="text-xs text-muted-foreground">
                    {todo.isCompleted && todo.completedAt ? `Completed: ${format(todo.completedAt, "PPp")}` : `Created: ${format(todo.createdAt, "PPp")}`}
                </span>
                <AlertDialog>
                    <AlertDialogTrigger asChild>
                    <Button variant="ghost" size="icon" className="text-destructive hover:bg-destructive/10 rounded-md h-8 w-8">
                        <Icons.trash className="h-4 w-4" />
                    </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent className="rounded-xl bg-card/90 backdrop-blur-md z-[51]">
                    <AlertDialogHeader>
                        <AlertDialogTitle className="text-card-foreground">Delete Task?</AlertDialogTitle>
                        <AlertDialogDescription className="text-muted-foreground">
                        Are you sure you want to delete the task: "{todo.text}"?
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel className="rounded-lg hover:bg-muted/20">Cancel</AlertDialogCancel>
                        <AlertDialogAction
                        onClick={() => handleDeleteTodo(todo.id)}
                        className="rounded-lg bg-destructive hover:bg-destructive/90 text-destructive-foreground"
                        >
                        Delete
                        </AlertDialogAction>
                    </AlertDialogFooter>
                    </AlertDialogContent>
                </AlertDialog>
                </div>
            </li>
            ))}
        </ul>
        )}
    </ScrollArea>
  );


  return (
    <div className="container mx-auto p-4 sm:p-6 md:p-8 min-h-screen flex flex-col bg-background/70 backdrop-blur-sm">
      <Toaster />
      <header className="flex flex-row justify-between items-center gap-4 mb-6 sm:mb-8">
        <h1 className="text-3xl sm:text-4xl font-bold text-primary flex items-center justify-center sm:justify-start">
          <Icons.clipboardList className="h-8 w-8 sm:h-10 sm:w-10 md:mr-2" />
          <span className="hidden md:inline">To-Do List</span>
        </h1>
        <Link href="/" passHref>
          <Button variant="outline" className="w-auto rounded-lg shadow-md hover:bg-primary/10 transition-all">
            <Icons.arrowLeft className="mr-2 h-5 w-5" />
            Back to Dashboard
          </Button>
        </Link>
      </header>

      <Card className="mb-6 sm:mb-8 rounded-xl shadow-lg bg-card/80 backdrop-blur-md">
        <CardHeader>
          <CardTitle className="text-xl sm:text-2xl font-semibold text-card-foreground">Add New Task</CardTitle>
          <CardDescription>Keep track of your pending tasks and mark them as completed.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col sm:flex-row space-y-3 sm:space-y-0 sm:space-x-3">
            <Input
              id="new-todo-text"
              value={newTodoText}
              onChange={(e) => setNewTodoText(e.target.value)}
              placeholder="e.g., Pay electricity bill"
              className="flex-grow rounded-lg shadow-inner bg-background/70 backdrop-blur-sm focus:ring-2 focus:ring-primary h-11 text-base"
              onKeyDown={(e) => e.key === 'Enter' && handleAddTodo()}
            />
            <Button onClick={handleAddTodo} className="rounded-lg shadow-md bg-primary hover:bg-primary/90 transition-all duration-300 ease-in-out transform hover:scale-105 h-11 px-6 text-base">
              <Icons.plusCircle className="mr-2 h-5 w-5" />
              Add Task
            </Button>
          </div>
        </CardContent>
      </Card>

      <Tabs defaultValue="ongoing" className="w-full flex-grow flex flex-col">
        <TabsList className="grid w-full grid-cols-2 sm:w-[400px] rounded-lg shadow-md mb-6 bg-card/80 backdrop-blur-md">
          <TabsTrigger value="ongoing" className="rounded-md data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=active]:shadow-lg text-base py-2.5">Ongoing Tasks</TabsTrigger>
          <TabsTrigger value="completed" className="rounded-md data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=active]:shadow-lg text-base py-2.5">Completed Tasks</TabsTrigger>
        </TabsList>
        
        <Card className="flex-grow rounded-xl shadow-lg bg-card/80 backdrop-blur-md">
            <CardContent className="p-4 sm:p-6 h-full">
                <TabsContent value="ongoing" className="mt-0 h-full">
                    {renderTodoList(ongoingTodos, 'ongoing')}
                </TabsContent>
                <TabsContent value="completed" className="mt-0 h-full">
                    {renderTodoList(completedTodos, 'completed')}
                </TabsContent>
            </CardContent>
        </Card>
      </Tabs>

      <footer className="mt-auto border-t border-border/50 pt-8 pb-6 text-center">
        <div className="container mx-auto">
          <p className="text-sm text-foreground">
            © {new Date().getFullYear()} PocketLedger Pro. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
}
