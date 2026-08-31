export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  public: {
    Tables: {
      assessment_analyses: {
        Row: {
          analysis_snapshot: Json
          analysis_version: number
          generated_at: string
          id: string
          instrument_version: string
          organization_id: string
          session_id: string
          submission_id: string
          superseded_at: string | null
        }
        Insert: {
          analysis_snapshot: Json
          analysis_version: number
          generated_at?: string
          id?: string
          instrument_version: string
          organization_id: string
          session_id: string
          submission_id: string
          superseded_at?: string | null
        }
        Update: {
          analysis_snapshot?: Json
          analysis_version?: number
          generated_at?: string
          id?: string
          instrument_version?: string
          organization_id?: string
          session_id?: string
          submission_id?: string
          superseded_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "assessment_analyses_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "assessment_analyses_session_id_fkey"
            columns: ["session_id"]
            isOneToOne: false
            referencedRelation: "assessment_sessions"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "assessment_analyses_session_id_organization_id_fkey"
            columns: ["session_id", "organization_id"]
            isOneToOne: false
            referencedRelation: "assessment_sessions"
            referencedColumns: ["id", "organization_id"]
          },
          {
            foreignKeyName: "assessment_analyses_submission_id_fkey"
            columns: ["submission_id"]
            isOneToOne: false
            referencedRelation: "assessment_submissions"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "assessment_analyses_submission_id_organization_id_fkey"
            columns: ["submission_id", "organization_id"]
            isOneToOne: false
            referencedRelation: "assessment_submissions"
            referencedColumns: ["id", "organization_id"]
          },
        ]
      }
      assessment_sessions: {
        Row: {
          candidate_id: string
          completed_at: string | null
          created_at: string
          created_by_membership_id: string
          current_section: number
          expires_at: string
          id: string
          instrument_version: string
          last_saved_at: string | null
          organization_id: string
          owning_membership_id: string
          progress_snapshot: Json | null
          public_id: string
          revoked_at: string | null
          started_at: string | null
          status: Database["public"]["Enums"]["assessment_session_status"]
          submitted_at: string | null
          token_hash: string
          updated_at: string
        }
        Insert: {
          candidate_id: string
          completed_at?: string | null
          created_at?: string
          created_by_membership_id: string
          current_section?: number
          expires_at: string
          id?: string
          instrument_version?: string
          last_saved_at?: string | null
          organization_id: string
          owning_membership_id: string
          progress_snapshot?: Json | null
          public_id?: string
          revoked_at?: string | null
          started_at?: string | null
          status?: Database["public"]["Enums"]["assessment_session_status"]
          submitted_at?: string | null
          token_hash: string
          updated_at?: string
        }
        Update: {
          candidate_id?: string
          completed_at?: string | null
          created_at?: string
          created_by_membership_id?: string
          current_section?: number
          expires_at?: string
          id?: string
          instrument_version?: string
          last_saved_at?: string | null
          organization_id?: string
          owning_membership_id?: string
          progress_snapshot?: Json | null
          public_id?: string
          revoked_at?: string | null
          started_at?: string | null
          status?: Database["public"]["Enums"]["assessment_session_status"]
          submitted_at?: string | null
          token_hash?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "assessment_sessions_candidate_id_fkey"
            columns: ["candidate_id"]
            isOneToOne: false
            referencedRelation: "candidates"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "assessment_sessions_candidate_id_organization_id_fkey"
            columns: ["candidate_id", "organization_id"]
            isOneToOne: false
            referencedRelation: "candidates"
            referencedColumns: ["id", "organization_id"]
          },
          {
            foreignKeyName: "assessment_sessions_created_by_membership_id_organization__fkey"
            columns: ["created_by_membership_id", "organization_id"]
            isOneToOne: false
            referencedRelation: "organization_memberships"
            referencedColumns: ["id", "organization_id"]
          },
          {
            foreignKeyName: "assessment_sessions_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "assessment_sessions_owning_membership_id_organization_id_fkey"
            columns: ["owning_membership_id", "organization_id"]
            isOneToOne: false
            referencedRelation: "organization_memberships"
            referencedColumns: ["id", "organization_id"]
          },
        ]
      }
      assessment_submissions: {
        Row: {
          id: string
          instrument_version: string
          intake_snapshot: Json
          organization_id: string
          response_snapshot: Json
          session_id: string
          submitted_at: string
        }
        Insert: {
          id?: string
          instrument_version: string
          intake_snapshot: Json
          organization_id: string
          response_snapshot: Json
          session_id: string
          submitted_at?: string
        }
        Update: {
          id?: string
          instrument_version?: string
          intake_snapshot?: Json
          organization_id?: string
          response_snapshot?: Json
          session_id?: string
          submitted_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "assessment_submissions_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "assessment_submissions_session_id_fkey"
            columns: ["session_id"]
            isOneToOne: true
            referencedRelation: "assessment_sessions"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "assessment_submissions_session_id_organization_id_fkey"
            columns: ["session_id", "organization_id"]
            isOneToOne: false
            referencedRelation: "assessment_sessions"
            referencedColumns: ["id", "organization_id"]
          },
        ]
      }
      candidate_assignment_history: {
        Row: {
          candidate_id: string
          changed_at: string
          changed_by_membership_id: string
          id: string
          new_membership_id: string
          organization_id: string
          previous_membership_id: string
          reason: string | null
        }
        Insert: {
          candidate_id: string
          changed_at?: string
          changed_by_membership_id: string
          id?: string
          new_membership_id: string
          organization_id: string
          previous_membership_id: string
          reason?: string | null
        }
        Update: {
          candidate_id?: string
          changed_at?: string
          changed_by_membership_id?: string
          id?: string
          new_membership_id?: string
          organization_id?: string
          previous_membership_id?: string
          reason?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "candidate_assignment_history_actor_fk"
            columns: ["changed_by_membership_id", "organization_id"]
            isOneToOne: false
            referencedRelation: "organization_memberships"
            referencedColumns: ["id", "organization_id"]
          },
          {
            foreignKeyName: "candidate_assignment_history_candidate_fk"
            columns: ["candidate_id", "organization_id"]
            isOneToOne: false
            referencedRelation: "candidates"
            referencedColumns: ["id", "organization_id"]
          },
          {
            foreignKeyName: "candidate_assignment_history_new_fk"
            columns: ["new_membership_id", "organization_id"]
            isOneToOne: false
            referencedRelation: "organization_memberships"
            referencedColumns: ["id", "organization_id"]
          },
          {
            foreignKeyName: "candidate_assignment_history_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "candidate_assignment_history_previous_fk"
            columns: ["previous_membership_id", "organization_id"]
            isOneToOne: false
            referencedRelation: "organization_memberships"
            referencedColumns: ["id", "organization_id"]
          },
        ]
      }
      candidates: {
        Row: {
          archived_at: string | null
          assigned_membership_id: string
          created_at: string
          created_by_membership_id: string
          email: string
          first_name: string
          id: string
          last_name: string
          organization_id: string
          phone: string | null
          pipeline_stage_id: string
          preferred_name: string | null
          public_id: string
          status: Database["public"]["Enums"]["candidate_status"]
          updated_at: string
        }
        Insert: {
          archived_at?: string | null
          assigned_membership_id: string
          created_at?: string
          created_by_membership_id: string
          email: string
          first_name: string
          id?: string
          last_name: string
          organization_id: string
          phone?: string | null
          pipeline_stage_id?: string
          preferred_name?: string | null
          public_id?: string
          status?: Database["public"]["Enums"]["candidate_status"]
          updated_at?: string
        }
        Update: {
          archived_at?: string | null
          assigned_membership_id?: string
          created_at?: string
          created_by_membership_id?: string
          email?: string
          first_name?: string
          id?: string
          last_name?: string
          organization_id?: string
          phone?: string | null
          pipeline_stage_id?: string
          preferred_name?: string | null
          public_id?: string
          status?: Database["public"]["Enums"]["candidate_status"]
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "candidates_assignee_same_organization_fk"
            columns: ["assigned_membership_id", "organization_id"]
            isOneToOne: false
            referencedRelation: "organization_memberships"
            referencedColumns: ["id", "organization_id"]
          },
          {
            foreignKeyName: "candidates_creator_same_organization_fk"
            columns: ["created_by_membership_id", "organization_id"]
            isOneToOne: false
            referencedRelation: "organization_memberships"
            referencedColumns: ["id", "organization_id"]
          },
          {
            foreignKeyName: "candidates_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      connected_email_accounts: {
        Row: {
          connected_at: string | null
          created_at: string
          disconnected_at: string | null
          display_name: string | null
          email_address: string
          granted_scopes: string[]
          id: string
          last_token_refresh_at: string | null
          organization_id: string
          owner_membership_id: string
          provider: Database["public"]["Enums"]["email_provider"]
          provider_account_id: string
          public_id: string
          status: Database["public"]["Enums"]["connected_email_account_status"]
          updated_at: string
        }
        Insert: {
          connected_at?: string | null
          created_at?: string
          disconnected_at?: string | null
          display_name?: string | null
          email_address: string
          granted_scopes?: string[]
          id?: string
          last_token_refresh_at?: string | null
          organization_id: string
          owner_membership_id: string
          provider: Database["public"]["Enums"]["email_provider"]
          provider_account_id: string
          public_id?: string
          status?: Database["public"]["Enums"]["connected_email_account_status"]
          updated_at?: string
        }
        Update: {
          connected_at?: string | null
          created_at?: string
          disconnected_at?: string | null
          display_name?: string | null
          email_address?: string
          granted_scopes?: string[]
          id?: string
          last_token_refresh_at?: string | null
          organization_id?: string
          owner_membership_id?: string
          provider?: Database["public"]["Enums"]["email_provider"]
          provider_account_id?: string
          public_id?: string
          status?: Database["public"]["Enums"]["connected_email_account_status"]
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "connected_email_accounts_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "connected_email_accounts_owner_same_organization_fk"
            columns: ["owner_membership_id", "organization_id"]
            isOneToOne: false
            referencedRelation: "organization_memberships"
            referencedColumns: ["id", "organization_id"]
          },
        ]
      }
      connected_email_credentials: {
        Row: {
          access_token_expires_at: string | null
          cipher_provider: string
          cipher_version: number
          connected_email_account_id: string
          created_at: string
          encrypted_payload: string
          updated_at: string
        }
        Insert: {
          access_token_expires_at?: string | null
          cipher_provider: string
          cipher_version: number
          connected_email_account_id: string
          created_at?: string
          encrypted_payload: string
          updated_at?: string
        }
        Update: {
          access_token_expires_at?: string | null
          cipher_provider?: string
          cipher_version?: number
          connected_email_account_id?: string
          created_at?: string
          encrypted_payload?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "connected_email_credentials_connected_email_account_id_fkey"
            columns: ["connected_email_account_id"]
            isOneToOne: true
            referencedRelation: "connected_email_accounts"
            referencedColumns: ["id"]
          },
        ]
      }
      consultant_profiles: {
        Row: {
          created_at: string
          display_name: string | null
          linkedin_url: string | null
          membership_id: string
          organization_id: string
          professional_email: string | null
          professional_phone: string | null
          professional_title: string | null
          scheduling_url: string | null
          updated_at: string
        }
        Insert: {
          created_at?: string
          display_name?: string | null
          linkedin_url?: string | null
          membership_id: string
          organization_id: string
          professional_email?: string | null
          professional_phone?: string | null
          professional_title?: string | null
          scheduling_url?: string | null
          updated_at?: string
        }
        Update: {
          created_at?: string
          display_name?: string | null
          linkedin_url?: string | null
          membership_id?: string
          organization_id?: string
          professional_email?: string | null
          professional_phone?: string | null
          professional_title?: string | null
          scheduling_url?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "consultant_profiles_membership_organization_fk"
            columns: ["membership_id", "organization_id"]
            isOneToOne: false
            referencedRelation: "organization_memberships"
            referencedColumns: ["id", "organization_id"]
          },
        ]
      }
      discovery_intelligence: {
        Row: {
          brand_strategy_readiness: string
          candidate_id: string
          current_snapshot: Json
          generated_at: string
          id: string
          organization_id: string
          session_id: string
          superseded_at: string | null
          version: number
        }
        Insert: {
          brand_strategy_readiness: string
          candidate_id: string
          current_snapshot: Json
          generated_at?: string
          id?: string
          organization_id: string
          session_id: string
          superseded_at?: string | null
          version?: number
        }
        Update: {
          brand_strategy_readiness?: string
          candidate_id?: string
          current_snapshot?: Json
          generated_at?: string
          id?: string
          organization_id?: string
          session_id?: string
          superseded_at?: string | null
          version?: number
        }
        Relationships: [
          {
            foreignKeyName: "discovery_intelligence_candidate_id_organization_id_fkey"
            columns: ["candidate_id", "organization_id"]
            isOneToOne: false
            referencedRelation: "candidates"
            referencedColumns: ["id", "organization_id"]
          },
          {
            foreignKeyName: "discovery_intelligence_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "discovery_intelligence_session_id_organization_id_fkey"
            columns: ["session_id", "organization_id"]
            isOneToOne: false
            referencedRelation: "discovery_sessions"
            referencedColumns: ["id", "organization_id"]
          },
        ]
      }
      discovery_observations: {
        Row: {
          candidate_id: string
          candidate_statement: string
          consultant_significance: string
          created_at: string
          created_by_membership_id: string
          finding: string
          follow_up_needed: boolean
          id: string
          organization_id: string
          session_id: string
          source: string
          status: Database["public"]["Enums"]["discovery_finding_status"]
          topic_key: string
          topic_label: string
          updated_at: string
        }
        Insert: {
          candidate_id: string
          candidate_statement?: string
          consultant_significance?: string
          created_at?: string
          created_by_membership_id: string
          finding: string
          follow_up_needed?: boolean
          id?: string
          organization_id: string
          session_id: string
          source?: string
          status: Database["public"]["Enums"]["discovery_finding_status"]
          topic_key: string
          topic_label: string
          updated_at?: string
        }
        Update: {
          candidate_id?: string
          candidate_statement?: string
          consultant_significance?: string
          created_at?: string
          created_by_membership_id?: string
          finding?: string
          follow_up_needed?: boolean
          id?: string
          organization_id?: string
          session_id?: string
          source?: string
          status?: Database["public"]["Enums"]["discovery_finding_status"]
          topic_key?: string
          topic_label?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "discovery_observations_candidate_id_organization_id_fkey"
            columns: ["candidate_id", "organization_id"]
            isOneToOne: false
            referencedRelation: "candidates"
            referencedColumns: ["id", "organization_id"]
          },
          {
            foreignKeyName: "discovery_observations_created_by_membership_id_organizati_fkey"
            columns: ["created_by_membership_id", "organization_id"]
            isOneToOne: false
            referencedRelation: "organization_memberships"
            referencedColumns: ["id", "organization_id"]
          },
          {
            foreignKeyName: "discovery_observations_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "discovery_observations_session_id_organization_id_fkey"
            columns: ["session_id", "organization_id"]
            isOneToOne: false
            referencedRelation: "discovery_sessions"
            referencedColumns: ["id", "organization_id"]
          },
        ]
      }
      discovery_sessions: {
        Row: {
          assessment_session_id: string
          candidate_id: string
          completed_at: string | null
          consultant_membership_id: string
          consultant_notes: string
          created_at: string
          id: string
          next_steps: string
          occurred_at: string | null
          organization_id: string
          public_id: string
          scheduled_at: string | null
          started_at: string | null
          status: Database["public"]["Enums"]["discovery_session_status"]
          summary: string
          updated_at: string
        }
        Insert: {
          assessment_session_id: string
          candidate_id: string
          completed_at?: string | null
          consultant_membership_id: string
          consultant_notes?: string
          created_at?: string
          id?: string
          next_steps?: string
          occurred_at?: string | null
          organization_id: string
          public_id?: string
          scheduled_at?: string | null
          started_at?: string | null
          status?: Database["public"]["Enums"]["discovery_session_status"]
          summary?: string
          updated_at?: string
        }
        Update: {
          assessment_session_id?: string
          candidate_id?: string
          completed_at?: string | null
          consultant_membership_id?: string
          consultant_notes?: string
          created_at?: string
          id?: string
          next_steps?: string
          occurred_at?: string | null
          organization_id?: string
          public_id?: string
          scheduled_at?: string | null
          started_at?: string | null
          status?: Database["public"]["Enums"]["discovery_session_status"]
          summary?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "discovery_sessions_assessment_session_id_organization_id_fkey"
            columns: ["assessment_session_id", "organization_id"]
            isOneToOne: false
            referencedRelation: "assessment_sessions"
            referencedColumns: ["id", "organization_id"]
          },
          {
            foreignKeyName: "discovery_sessions_candidate_id_organization_id_fkey"
            columns: ["candidate_id", "organization_id"]
            isOneToOne: false
            referencedRelation: "candidates"
            referencedColumns: ["id", "organization_id"]
          },
          {
            foreignKeyName: "discovery_sessions_consultant_membership_id_organization_i_fkey"
            columns: ["consultant_membership_id", "organization_id"]
            isOneToOne: false
            referencedRelation: "organization_memberships"
            referencedColumns: ["id", "organization_id"]
          },
          {
            foreignKeyName: "discovery_sessions_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      email_delivery_attempts: {
        Row: {
          attempt_number: number
          completed_at: string | null
          created_at: string
          email_message_id: string
          error_code: string | null
          id: string
          provider_message_id: string | null
          provider_request_started_at: string
          provider_thread_id: string | null
          retryable: boolean
          status: Database["public"]["Enums"]["email_attempt_status"]
        }
        Insert: {
          attempt_number: number
          completed_at?: string | null
          created_at?: string
          email_message_id: string
          error_code?: string | null
          id?: string
          provider_message_id?: string | null
          provider_request_started_at?: string
          provider_thread_id?: string | null
          retryable?: boolean
          status: Database["public"]["Enums"]["email_attempt_status"]
        }
        Update: {
          attempt_number?: number
          completed_at?: string | null
          created_at?: string
          email_message_id?: string
          error_code?: string | null
          id?: string
          provider_message_id?: string | null
          provider_request_started_at?: string
          provider_thread_id?: string | null
          retryable?: boolean
          status?: Database["public"]["Enums"]["email_attempt_status"]
        }
        Relationships: [
          {
            foreignKeyName: "email_delivery_attempts_email_message_id_fkey"
            columns: ["email_message_id"]
            isOneToOne: false
            referencedRelation: "email_messages"
            referencedColumns: ["id"]
          },
        ]
      }
      email_messages: {
        Row: {
          candidate_id: string
          connected_email_account_id: string
          created_at: string
          direction: string
          id: string
          internet_message_id: string
          organization_id: string
          owner_membership_id: string
          provenance: string
          provider: Database["public"]["Enums"]["email_provider"]
          provider_message_id: string | null
          provider_thread_id: string | null
          public_id: string
          send_idempotency_key: string
          sender_email: string
          sender_name: string | null
          sent_at: string | null
          status: Database["public"]["Enums"]["outbound_email_status"]
          subject: string
          text_body: string
          updated_at: string
        }
        Insert: {
          candidate_id: string
          connected_email_account_id: string
          created_at?: string
          direction?: string
          id?: string
          internet_message_id: string
          organization_id: string
          owner_membership_id: string
          provenance?: string
          provider: Database["public"]["Enums"]["email_provider"]
          provider_message_id?: string | null
          provider_thread_id?: string | null
          public_id?: string
          send_idempotency_key: string
          sender_email: string
          sender_name?: string | null
          sent_at?: string | null
          status?: Database["public"]["Enums"]["outbound_email_status"]
          subject: string
          text_body: string
          updated_at?: string
        }
        Update: {
          candidate_id?: string
          connected_email_account_id?: string
          created_at?: string
          direction?: string
          id?: string
          internet_message_id?: string
          organization_id?: string
          owner_membership_id?: string
          provenance?: string
          provider?: Database["public"]["Enums"]["email_provider"]
          provider_message_id?: string | null
          provider_thread_id?: string | null
          public_id?: string
          send_idempotency_key?: string
          sender_email?: string
          sender_name?: string | null
          sent_at?: string | null
          status?: Database["public"]["Enums"]["outbound_email_status"]
          subject?: string
          text_body?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "email_messages_account_owner_fk"
            columns: [
              "connected_email_account_id",
              "organization_id",
              "owner_membership_id",
            ]
            isOneToOne: false
            referencedRelation: "connected_email_accounts"
            referencedColumns: ["id", "organization_id", "owner_membership_id"]
          },
          {
            foreignKeyName: "email_messages_candidate_same_organization_fk"
            columns: ["candidate_id", "organization_id"]
            isOneToOne: false
            referencedRelation: "candidates"
            referencedColumns: ["id", "organization_id"]
          },
          {
            foreignKeyName: "email_messages_connected_email_account_id_fkey"
            columns: ["connected_email_account_id"]
            isOneToOne: false
            referencedRelation: "connected_email_accounts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "email_messages_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "email_messages_owner_same_organization_fk"
            columns: ["owner_membership_id", "organization_id"]
            isOneToOne: false
            referencedRelation: "organization_memberships"
            referencedColumns: ["id", "organization_id"]
          },
        ]
      }
      email_oauth_transactions: {
        Row: {
          created_at: string
          expires_at: string
          id: string
          organization_id: string
          owner_membership_id: string
          pkce_verifier_hash: string
          provider: Database["public"]["Enums"]["email_provider"]
          return_path: string
          state_hash: string
          user_id: string
        }
        Insert: {
          created_at?: string
          expires_at: string
          id?: string
          organization_id: string
          owner_membership_id: string
          pkce_verifier_hash: string
          provider: Database["public"]["Enums"]["email_provider"]
          return_path: string
          state_hash: string
          user_id: string
        }
        Update: {
          created_at?: string
          expires_at?: string
          id?: string
          organization_id?: string
          owner_membership_id?: string
          pkce_verifier_hash?: string
          provider?: Database["public"]["Enums"]["email_provider"]
          return_path?: string
          state_hash?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "email_oauth_transactions_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "email_oauth_transactions_owner_same_organization_fk"
            columns: ["owner_membership_id", "organization_id"]
            isOneToOne: false
            referencedRelation: "organization_memberships"
            referencedColumns: ["id", "organization_id"]
          },
        ]
      }
      email_recipients: {
        Row: {
          display_name: string | null
          email_address: string
          email_message_id: string
          id: string
          kind: Database["public"]["Enums"]["email_recipient_kind"]
          recipient_order: number
        }
        Insert: {
          display_name?: string | null
          email_address: string
          email_message_id: string
          id?: string
          kind: Database["public"]["Enums"]["email_recipient_kind"]
          recipient_order?: number
        }
        Update: {
          display_name?: string | null
          email_address?: string
          email_message_id?: string
          id?: string
          kind?: Database["public"]["Enums"]["email_recipient_kind"]
          recipient_order?: number
        }
        Relationships: [
          {
            foreignKeyName: "email_recipients_email_message_id_fkey"
            columns: ["email_message_id"]
            isOneToOne: false
            referencedRelation: "email_messages"
            referencedColumns: ["id"]
          },
        ]
      }
      membership_invitations: {
        Row: {
          accepted_at: string | null
          accepted_membership_id: string | null
          created_at: string
          expires_at: string
          id: string
          intended_role: Database["public"]["Enums"]["membership_role"]
          invited_email: string
          inviter_membership_id: string
          organization_id: string
          revoked_at: string | null
          status: Database["public"]["Enums"]["membership_invitation_status"]
          token_hash: string
        }
        Insert: {
          accepted_at?: string | null
          accepted_membership_id?: string | null
          created_at?: string
          expires_at: string
          id?: string
          intended_role: Database["public"]["Enums"]["membership_role"]
          invited_email: string
          inviter_membership_id: string
          organization_id: string
          revoked_at?: string | null
          status?: Database["public"]["Enums"]["membership_invitation_status"]
          token_hash: string
        }
        Update: {
          accepted_at?: string | null
          accepted_membership_id?: string | null
          created_at?: string
          expires_at?: string
          id?: string
          intended_role?: Database["public"]["Enums"]["membership_role"]
          invited_email?: string
          inviter_membership_id?: string
          organization_id?: string
          revoked_at?: string | null
          status?: Database["public"]["Enums"]["membership_invitation_status"]
          token_hash?: string
        }
        Relationships: [
          {
            foreignKeyName: "membership_invitations_accepted_membership_fk"
            columns: ["accepted_membership_id", "organization_id"]
            isOneToOne: false
            referencedRelation: "organization_memberships"
            referencedColumns: ["id", "organization_id"]
          },
          {
            foreignKeyName: "membership_invitations_inviter_fk"
            columns: ["inviter_membership_id", "organization_id"]
            isOneToOne: false
            referencedRelation: "organization_memberships"
            referencedColumns: ["id", "organization_id"]
          },
          {
            foreignKeyName: "membership_invitations_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      membership_onboarding: {
        Row: {
          completed_at: string | null
          completed_steps: string[]
          created_at: string
          current_step: string | null
          membership_id: string
          onboarding_version: number
          organization_id: string
          started_at: string | null
          status: Database["public"]["Enums"]["membership_onboarding_status"]
          updated_at: string
        }
        Insert: {
          completed_at?: string | null
          completed_steps?: string[]
          created_at?: string
          current_step?: string | null
          membership_id: string
          onboarding_version?: number
          organization_id: string
          started_at?: string | null
          status?: Database["public"]["Enums"]["membership_onboarding_status"]
          updated_at?: string
        }
        Update: {
          completed_at?: string | null
          completed_steps?: string[]
          created_at?: string
          current_step?: string | null
          membership_id?: string
          onboarding_version?: number
          organization_id?: string
          started_at?: string | null
          status?: Database["public"]["Enums"]["membership_onboarding_status"]
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "membership_onboarding_membership_organization_fk"
            columns: ["membership_id", "organization_id"]
            isOneToOne: false
            referencedRelation: "organization_memberships"
            referencedColumns: ["id", "organization_id"]
          },
        ]
      }
      membership_reporting_history: {
        Row: {
          changed_at: string
          changed_by_membership_id: string | null
          id: string
          membership_id: string
          new_manager_membership_id: string | null
          organization_id: string
          previous_manager_membership_id: string | null
          reason: string | null
        }
        Insert: {
          changed_at?: string
          changed_by_membership_id?: string | null
          id?: string
          membership_id: string
          new_manager_membership_id?: string | null
          organization_id: string
          previous_manager_membership_id?: string | null
          reason?: string | null
        }
        Update: {
          changed_at?: string
          changed_by_membership_id?: string | null
          id?: string
          membership_id?: string
          new_manager_membership_id?: string | null
          organization_id?: string
          previous_manager_membership_id?: string | null
          reason?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "membership_reporting_history_actor_fk"
            columns: ["changed_by_membership_id", "organization_id"]
            isOneToOne: false
            referencedRelation: "organization_memberships"
            referencedColumns: ["id", "organization_id"]
          },
          {
            foreignKeyName: "membership_reporting_history_membership_fk"
            columns: ["membership_id", "organization_id"]
            isOneToOne: false
            referencedRelation: "organization_memberships"
            referencedColumns: ["id", "organization_id"]
          },
          {
            foreignKeyName: "membership_reporting_history_new_manager_fk"
            columns: ["new_manager_membership_id", "organization_id"]
            isOneToOne: false
            referencedRelation: "organization_memberships"
            referencedColumns: ["id", "organization_id"]
          },
          {
            foreignKeyName: "membership_reporting_history_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "membership_reporting_history_previous_manager_fk"
            columns: ["previous_manager_membership_id", "organization_id"]
            isOneToOne: false
            referencedRelation: "organization_memberships"
            referencedColumns: ["id", "organization_id"]
          },
        ]
      }
      organization_memberships: {
        Row: {
          created_at: string
          id: string
          manager_membership_id: string | null
          organization_id: string
          role: Database["public"]["Enums"]["membership_role"]
          status: Database["public"]["Enums"]["membership_status"]
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          manager_membership_id?: string | null
          organization_id: string
          role?: Database["public"]["Enums"]["membership_role"]
          status?: Database["public"]["Enums"]["membership_status"]
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          manager_membership_id?: string | null
          organization_id?: string
          role?: Database["public"]["Enums"]["membership_role"]
          status?: Database["public"]["Enums"]["membership_status"]
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "organization_memberships_manager_same_organization_fk"
            columns: ["manager_membership_id", "organization_id"]
            isOneToOne: false
            referencedRelation: "organization_memberships"
            referencedColumns: ["id", "organization_id"]
          },
          {
            foreignKeyName: "organization_memberships_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      organization_settings: {
        Row: {
          branding_version: number
          created_at: string
          display_name: string | null
          organization_id: string
          updated_at: string
          website_url: string | null
        }
        Insert: {
          branding_version?: number
          created_at?: string
          display_name?: string | null
          organization_id: string
          updated_at?: string
          website_url?: string | null
        }
        Update: {
          branding_version?: number
          created_at?: string
          display_name?: string | null
          organization_id?: string
          updated_at?: string
          website_url?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "organization_settings_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: true
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      organizations: {
        Row: {
          created_at: string
          id: string
          name: string
          public_id: string
          status: Database["public"]["Enums"]["organization_status"]
          updated_at: string
        }
        Insert: {
          created_at?: string
          id?: string
          name: string
          public_id?: string
          status?: Database["public"]["Enums"]["organization_status"]
          updated_at?: string
        }
        Update: {
          created_at?: string
          id?: string
          name?: string
          public_id?: string
          status?: Database["public"]["Enums"]["organization_status"]
          updated_at?: string
        }
        Relationships: []
      }
      user_profiles: {
        Row: {
          created_at: string
          display_name: string | null
          locale: string
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          display_name?: string | null
          locale?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          display_name?: string | null
          locale?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      accept_membership_invitation: {
        Args: { presented_token: string }
        Returns: {
          accepted: boolean
          membership_id: string
          organization_id: string
        }[]
      }
      begin_outbound_email_send: {
        Args: {
          idempotency_key: string
          proposed_body: string
          proposed_internet_message_id: string
          proposed_message_public_id: string
          proposed_subject: string
          target_account_public_id: string
          target_candidate_public_id: string
        }
        Returns: {
          candidate_id: string
          connected_email_account_id: string
          created_at: string
          direction: string
          id: string
          internet_message_id: string
          organization_id: string
          owner_membership_id: string
          provenance: string
          provider: Database["public"]["Enums"]["email_provider"]
          provider_message_id: string | null
          provider_thread_id: string | null
          public_id: string
          send_idempotency_key: string
          sender_email: string
          sender_name: string | null
          sent_at: string | null
          status: Database["public"]["Enums"]["outbound_email_status"]
          subject: string
          text_body: string
          updated_at: string
        }
        SetofOptions: {
          from: "*"
          to: "email_messages"
          isOneToOne: true
          isSetofReturn: false
        }
      }
      bootstrap_first_workspace: {
        Args: {
          proposed_consultant_display_name: string
          proposed_organization_name: string
        }
        Returns: {
          created: boolean
          membership_id: string
          organization_id: string
          organization_name: string
          organization_public_id: string
        }[]
      }
      can_access_candidate: {
        Args: { target_candidate_id: string }
        Returns: boolean
      }
      can_view_membership: {
        Args: { target_membership_id: string }
        Returns: boolean
      }
      claim_outbound_email_attempt: {
        Args: { is_retry: boolean; target_message_public_id: string }
        Returns: {
          attempt_number: number
          completed_at: string | null
          created_at: string
          email_message_id: string
          error_code: string | null
          id: string
          provider_message_id: string | null
          provider_request_started_at: string
          provider_thread_id: string | null
          retryable: boolean
          status: Database["public"]["Enums"]["email_attempt_status"]
        }
        SetofOptions: {
          from: "*"
          to: "email_delivery_attempts"
          isOneToOne: true
          isSetofReturn: false
        }
      }
      complete_discovery_session: {
        Args: {
          brand_strategy_readiness: string
          intelligence_snapshot: Json
          target_candidate_public_id: string
        }
        Returns: undefined
      }
      complete_outbound_email_attempt: {
        Args: {
          result_error_code?: string
          result_provider_message_id?: string
          result_provider_thread_id?: string
          result_retryable?: boolean
          result_status: Database["public"]["Enums"]["email_attempt_status"]
          target_attempt_id: string
          target_message_public_id: string
        }
        Returns: undefined
      }
      create_assessment_invitation: {
        Args: {
          invitation_expires_at: string
          presented_token_hash: string
          target_candidate_public_id: string
        }
        Returns: {
          candidate_id: string
          completed_at: string | null
          created_at: string
          created_by_membership_id: string
          current_section: number
          expires_at: string
          id: string
          instrument_version: string
          last_saved_at: string | null
          organization_id: string
          owning_membership_id: string
          progress_snapshot: Json | null
          public_id: string
          revoked_at: string | null
          started_at: string | null
          status: Database["public"]["Enums"]["assessment_session_status"]
          submitted_at: string | null
          token_hash: string
          updated_at: string
        }[]
        SetofOptions: {
          from: "*"
          to: "assessment_sessions"
          isOneToOne: false
          isSetofReturn: true
        }
      }
      create_membership_invitation: {
        Args: {
          presented_token: string
          proposed_email: string
          proposed_role: Database["public"]["Enums"]["membership_role"]
          target_organization_id: string
        }
        Returns: {
          created: boolean
          invitation_id: string
        }[]
      }
      current_active_membership_id: {
        Args: { target_organization_id: string }
        Returns: string
      }
      delete_relation_free_candidate: {
        Args: { target_candidate_public_id: string }
        Returns: string
      }
      discovery_session_payload: { Args: { sid: string }; Returns: Json }
      get_authorized_membership_ids: {
        Args: { target_organization_id: string }
        Returns: {
          membership_id: string
        }[]
      }
      get_candidate_assessment: {
        Args: { target_candidate_public_id: string }
        Returns: {
          analysis_snapshot: Json
          candidate_public_id: string
          completed_at: string
          current_section: number
          expires_at: string
          id: string
          last_saved_at: string
          progress_snapshot: Json
          public_id: string
          revoked_at: string
          started_at: string
          status: Database["public"]["Enums"]["assessment_session_status"]
          submitted_at: string
        }[]
      }
      get_or_create_discovery_session: {
        Args: { target_candidate_public_id: string }
        Returns: Json
      }
      has_organization_role: {
        Args: {
          allowed_roles: Database["public"]["Enums"]["membership_role"][]
          target_organization_id: string
        }
        Returns: boolean
      }
      has_workspace_capability: {
        Args: {
          capability: Database["public"]["Enums"]["workspace_capability"]
          target_organization_id: string
        }
        Returns: boolean
      }
      is_active_organization_member: {
        Args: { target_organization_id: string }
        Returns: boolean
      }
      is_membership_descendant: {
        Args: {
          ancestor_membership_id: string
          possible_descendant_membership_id: string
        }
        Returns: boolean
      }
      load_assessment_by_token: {
        Args: { presented_token_hash: string }
        Returns: {
          analysis_snapshot: Json
          candidate_public_id: string
          completed_at: string
          current_section: number
          expires_at: string
          id: string
          last_saved_at: string
          progress_snapshot: Json
          public_id: string
          revoked_at: string
          started_at: string
          status: Database["public"]["Enums"]["assessment_session_status"]
          submitted_at: string
        }[]
      }
      regenerate_assessment_analysis: {
        Args: {
          replacement_analysis: Json
          replacement_analysis_version: number
          target_candidate_public_id: string
        }
        Returns: undefined
      }
      resolve_membership_invitation: {
        Args: { presented_token: string }
        Returns: {
          intended_role: Database["public"]["Enums"]["membership_role"]
          organization_name: string
          resolution: string
        }[]
      }
      revoke_assessment_invitation: {
        Args: { target_candidate_public_id: string }
        Returns: undefined
      }
      revoke_membership_invitation: {
        Args: { target_invitation_id: string }
        Returns: undefined
      }
      save_assessment_progress: {
        Args: { presented_token_hash: string; progress_snapshot: Json }
        Returns: {
          candidate_id: string
          completed_at: string | null
          created_at: string
          created_by_membership_id: string
          current_section: number
          expires_at: string
          id: string
          instrument_version: string
          last_saved_at: string | null
          organization_id: string
          owning_membership_id: string
          progress_snapshot: Json | null
          public_id: string
          revoked_at: string | null
          started_at: string | null
          status: Database["public"]["Enums"]["assessment_session_status"]
          submitted_at: string | null
          token_hash: string
          updated_at: string
        }[]
        SetofOptions: {
          from: "*"
          to: "assessment_sessions"
          isOneToOne: false
          isSetofReturn: true
        }
      }
      save_consultant_profile: {
        Args: {
          proposed_display_name: string
          proposed_linkedin_url: string
          proposed_professional_email: string
          proposed_professional_phone: string
          proposed_professional_title: string
          proposed_scheduling_url: string
          target_organization_id: string
        }
        Returns: {
          created_at: string
          display_name: string | null
          linkedin_url: string | null
          membership_id: string
          organization_id: string
          professional_email: string | null
          professional_phone: string | null
          professional_title: string | null
          scheduling_url: string | null
          updated_at: string
        }
        SetofOptions: {
          from: "*"
          to: "consultant_profiles"
          isOneToOne: true
          isSetofReturn: false
        }
      }
      save_discovery_notes: {
        Args: {
          consultant_notes_text: string
          next_steps_text: string
          summary_text: string
          target_candidate_public_id: string
        }
        Returns: undefined
      }
      save_discovery_observation: {
        Args: {
          candidate_statement_text: string
          consultant_significance: string
          finding_status: Database["public"]["Enums"]["discovery_finding_status"]
          finding_text: string
          follow_up_needed: boolean
          target_candidate_public_id: string
          topic_key: string
          topic_label: string
        }
        Returns: undefined
      }
      save_organization_settings: {
        Args: {
          proposed_display_name: string
          proposed_website_url: string
          target_organization_id: string
        }
        Returns: {
          branding_version: number
          created_at: string
          display_name: string | null
          organization_id: string
          updated_at: string
          website_url: string | null
        }
        SetofOptions: {
          from: "*"
          to: "organization_settings"
          isOneToOne: true
          isSetofReturn: false
        }
      }
      set_membership_onboarding_state: {
        Args: {
          proposed_completed_steps: string[]
          proposed_current_step: string
          proposed_status: Database["public"]["Enums"]["membership_onboarding_status"]
          target_organization_id: string
        }
        Returns: {
          completed_at: string | null
          completed_steps: string[]
          created_at: string
          current_step: string | null
          membership_id: string
          onboarding_version: number
          organization_id: string
          started_at: string | null
          status: Database["public"]["Enums"]["membership_onboarding_status"]
          updated_at: string
        }
        SetofOptions: {
          from: "*"
          to: "membership_onboarding"
          isOneToOne: true
          isSetofReturn: false
        }
      }
      submit_assessment: {
        Args: {
          presented_token_hash: string
          submitted_analysis: Json
          submitted_analysis_version: number
          submitted_answers: Json
          submitted_intake: Json
        }
        Returns: {
          candidate_id: string
          completed_at: string | null
          created_at: string
          created_by_membership_id: string
          current_section: number
          expires_at: string
          id: string
          instrument_version: string
          last_saved_at: string | null
          organization_id: string
          owning_membership_id: string
          progress_snapshot: Json | null
          public_id: string
          revoked_at: string | null
          started_at: string | null
          status: Database["public"]["Enums"]["assessment_session_status"]
          submitted_at: string | null
          token_hash: string
          updated_at: string
        }[]
        SetofOptions: {
          from: "*"
          to: "assessment_sessions"
          isOneToOne: false
          isSetofReturn: true
        }
      }
    }
    Enums: {
      assessment_session_status:
        | "created"
        | "invited"
        | "in-progress"
        | "submitted"
        | "analyzed"
        | "expired"
        | "cancelled"
      candidate_status: "active" | "on-hold" | "inactive" | "won" | "lost"
      connected_email_account_status:
        | "pending"
        | "connected"
        | "action-required"
        | "revoked"
        | "disconnected"
      discovery_finding_status:
        | "confirmed"
        | "refined"
        | "contradicted"
        | "unclear"
      discovery_session_status:
        | "planned"
        | "in-progress"
        | "completed"
        | "cancelled"
      email_attempt_status:
        | "submitting"
        | "provider-accepted"
        | "failed-confirmed"
        | "ambiguous"
      email_provider: "google" | "microsoft"
      email_recipient_kind: "to" | "cc" | "bcc"
      membership_invitation_status: "pending" | "accepted" | "revoked"
      membership_onboarding_status: "not-started" | "in-progress" | "completed"
      membership_role: "owner" | "admin" | "manager" | "consultant"
      membership_status: "invited" | "active" | "suspended"
      organization_status: "active" | "suspended" | "archived"
      outbound_email_status:
        | "pending"
        | "submitting"
        | "provider-accepted"
        | "failed-confirmed"
        | "ambiguous"
      workspace_capability:
        | "organization:view"
        | "organization:manage"
        | "memberships:view_descendants"
        | "memberships:manage"
        | "hierarchy:view_descendants"
        | "hierarchy:manage"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      assessment_session_status: [
        "created",
        "invited",
        "in-progress",
        "submitted",
        "analyzed",
        "expired",
        "cancelled",
      ],
      candidate_status: ["active", "on-hold", "inactive", "won", "lost"],
      connected_email_account_status: [
        "pending",
        "connected",
        "action-required",
        "revoked",
        "disconnected",
      ],
      discovery_finding_status: [
        "confirmed",
        "refined",
        "contradicted",
        "unclear",
      ],
      discovery_session_status: [
        "planned",
        "in-progress",
        "completed",
        "cancelled",
      ],
      email_attempt_status: [
        "submitting",
        "provider-accepted",
        "failed-confirmed",
        "ambiguous",
      ],
      email_provider: ["google", "microsoft"],
      email_recipient_kind: ["to", "cc", "bcc"],
      membership_invitation_status: ["pending", "accepted", "revoked"],
      membership_onboarding_status: ["not-started", "in-progress", "completed"],
      membership_role: ["owner", "admin", "manager", "consultant"],
      membership_status: ["invited", "active", "suspended"],
      organization_status: ["active", "suspended", "archived"],
      outbound_email_status: [
        "pending",
        "submitting",
        "provider-accepted",
        "failed-confirmed",
        "ambiguous",
      ],
      workspace_capability: [
        "organization:view",
        "organization:manage",
        "memberships:view_descendants",
        "memberships:manage",
        "hierarchy:view_descendants",
        "hierarchy:manage",
      ],
    },
  },
} as const
