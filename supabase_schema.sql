-- ============================================
-- StyleSense — Supabase SQL Schema
-- Run this entire file in Supabase SQL Editor
-- ============================================

-- Enable pgvector extension
create extension if not exists vector;

-- ============================================
-- Products table
-- ============================================
create table products (
  id                uuid default gen_random_uuid() primary key,
    title             text not null,
      description       text,
        visual_description text,       -- what Qwen-VL actually sees (truth layer)
          price             numeric(10,2),
            category          text,
              sub_category      text,
                color             text,
                  gender            text,
                    season            text,
                      usage_type        text,
                        image_url         text,
                          is_corrupted      boolean default false,
                            original_name     text,        -- real name before corruption
                              created_at        timestamp default now()
                              );

                              -- ============================================
                              -- Product embeddings table
                              -- ============================================
                              create table product_embeddings (
                                id                  uuid default gen_random_uuid() primary key,
                                  product_id          uuid references products(id) on delete cascade,
                                    visual_embedding    vector(512),
                                      text_embedding      vector(512),
                                        combined_embedding  vector(512),
                                          model_used          text default 'clip-vit-base-patch32',
                                            created_at          timestamp default now()
                                            );

                                            -- Vector index for fast cosine similarity search
                                            create index on product_embeddings
                                            using ivfflat (combined_embedding vector_cosine_ops)
                                            with (lists = 10);

                                            -- ============================================
                                            -- Orders table (mock, for agent demo)
                                            -- ============================================
                                            create table orders (
                                              id            uuid default gen_random_uuid() primary key,
                                                customer_name text default 'Demo Customer',
                                                  product_id    uuid references products(id),
                                                    status        text default 'processing',
                                                      created_at    timestamp default now()
                                                      );

                                                      -- ============================================
                                                      -- RPC function for vector similarity search
                                                      -- Called by backend/db/queries.py → vector_search()
                                                      -- ============================================
                                                      create or replace function match_products(
                                                        query_embedding vector(512),
                                                          match_count int default 10
                                                          )
                                                          returns table (
                                                            id               uuid,
                                                              title            text,
                                                                description      text,
                                                                  visual_description text,
                                                                    image_url        text,
                                                                      price            numeric,
                                                                        category         text,
                                                                          sub_category     text,
                                                                            color            text,
                                                                              gender           text,
                                                                                is_corrupted     boolean,
                                                                                  similarity_score float
                                                                                  )
                                                                                  language sql stable
                                                                                  as $$
                                                                                    select
                                                                                        p.id,
                                                                                            p.title,
                                                                                                p.description,
                                                                                                    p.visual_description,
                                                                                                        p.image_url,
                                                                                                            p.price,
                                                                                                                p.category,
                                                                                                                    p.sub_category,
                                                                                                                        p.color,
                                                                                                                            p.gender,
                                                                                                                                p.is_corrupted,
                                                                                                                                    1 - (pe.combined_embedding <=> query_embedding) as similarity_score
                                                                                                                                      from products p
                                                                                                                                        join product_embeddings pe on pe.product_id = p.id
                                                                                                                                          order by pe.combined_embedding <=> query_embedding
                                                                                                                                            limit match_count;
                                                                                                                                            $$;

                                                                                                                                            -- ============================================
                                                                                                                                            -- Insert 3 mock orders (run after seeding products)
                                                                                                                                            -- ============================================
                                                                                                                                            -- Uncomment after seeding:
                                                                                                                                            -- insert into orders (product_id, status)
                                                                                                                                            -- select id, 'shipped' from products limit 3;
                                                                                                                                            