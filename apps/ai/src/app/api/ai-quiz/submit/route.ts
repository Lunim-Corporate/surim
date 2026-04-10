import { NextResponse } from "next/server";
import { Resend } from "resend";
import { supabaseServer } from "@surim/lib/supabase";
import { QuizResultEmail } from "@surim/ui/emails/QuizResultEmail";

interface QuizSubmission {
  name: string;
  email: string;
  answers: string[]; 
}

interface QuizResult {
  score: number;
  category: "The Manualist" | "The Hybrid Optimizer" | "The Automation Architect";
  categoryDescription: string;
}

const SCORE_MAP: Record<string, number> = {
  A: 1,
  B: 2,
  C: 3,
};

function calculateScore(answers: string[]): QuizResult {
  const totalScore = answers.reduce((sum, answer) => {
    return sum + (SCORE_MAP[answer] || 0);
  }, 0);

  let category: QuizResult["category"];
  let categoryDescription: string;

  if (totalScore >= 8 && totalScore <= 13) {
    category = "The Manualist";
    categoryDescription =
      "You're currently handling most tasks manually, but there's huge potential for automation to free up your time and boost efficiency.";
  } else if (totalScore >= 14 && totalScore <= 19) {
    category = "The Hybrid Optimizer";
    categoryDescription =
      "You're already using some automation tools, but there's room to optimize and integrate AI more deeply into your workflow.";
  } else {
    category = "The Automation Architect";
    categoryDescription =
      "You're an automation pro! You're leveraging AI and automation at a high level. Keep pushing boundaries with advanced tools.";
  }

  return {
    score: totalScore,
    category,
    categoryDescription,
  };
}

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as QuizSubmission;

    if (!body.name || !body.email || !Array.isArray(body.answers)) {
      return NextResponse.json(
        { success: false, message: "Missing required fields." },
        { status: 400 }
      );
    }

    if (body.answers.length !== 8) {
      return NextResponse.json(
        { success: false, message: "Invalid quiz answers. Expected 8 answers." },
        { status: 400 }
      );
    }

    const result = calculateScore(body.answers);

    const supabase = supabaseServer();
    let recordId: number | null = null;

    try {
      const { data: existingSubmission } = await supabase
        .from("quiz_submissions")
        .select("email")
        .eq("email", body.email)
        .maybeSingle();

      if (existingSubmission) {
        return NextResponse.json(
          {
            success: false,
            message: "This email has already been used to complete the quiz. Each email can only submit once.",
          },
          { status: 400 }
        );
      }

      const { data, error } = await supabase
        .from("quiz_submissions")
        .insert([
          {
            name: body.name,
            email: body.email,
            answers: body.answers,
            score: result.score,
            category: result.category,
            submitted_at: new Date().toISOString(),
          },
        ])
        .select("id")
        .single();

      if (error) {
        console.error("Supabase insert error:", error);
        if (error.code === '23505') {
          return NextResponse.json(
            {
              success: false,
              message: "This email has already been used to complete the quiz.",
            },
            { status: 400 }
          );
        }
      }

      if (data) {
        recordId = data.id;
      }
    } catch (dbError) {
      console.error("Supabase insert failed:", dbError);
    }

    const resendApiKey = process.env.RESEND_API_KEY;
    const fromEmail = process.env.RESEND_FROM_EMAIL || "noreply@updates.surim.io";
    const toolkitLink = process.env.TOOLKIT_DOWNLOAD_LINK || "https://surim.io/ai-toolkit";

    if (!resendApiKey) {
      console.error("RESEND_API_KEY not configured");
      return NextResponse.json(
        {
          success: true,
          score: result.score,
          category: result.category,
          message: "Quiz submitted but email could not be sent.",
        },
        { status: 200 }
      );
    }

    const resend = new Resend(resendApiKey);

    try {
      const subjectLines = {
        "The Manualist": `Your AI Readiness Score is in! (Plus, a gift from Luna 🎁)`,
        "The Hybrid Optimizer": `You're so close, ${body.name}! Here is your AI Readiness Report`,
        "The Automation Architect": `Impressive. You're an Automation Architect, ${body.name}`
      };

      const { error: emailError } = await resend.emails.send({
        from: `Luna from Surim AI <${fromEmail}>`,
        to: [body.email],
        subject: subjectLines[result.category], 
        react: QuizResultEmail({
          name: body.name,
          score: result.score,
          category: result.category,
          categoryDescription: result.categoryDescription,
          toolkitLink,
        }),
      });

      if (emailError) {
        console.error("Resend email error:", emailError);
      }
    } catch (emailError) {
      console.error("Failed to send email:", emailError);
    }

    return NextResponse.json(
      {
        success: true,
        score: result.score,
        category: result.category,
        categoryDescription: result.categoryDescription,
        recordId,
        message: "Quiz submitted successfully! Check your email for results.",
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Quiz submission error:", error);
    return NextResponse.json(
      {
        success: false,
        message: "An error occurred while processing your quiz.",
      },
      { status: 500 }
    );
  }
}