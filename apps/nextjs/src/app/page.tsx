export default function HomePage() {
  return (
    <main className="flex h-screen flex-col items-center justify-center gap-24">
      <h1 className="text-5xl">鉛筆</h1>
      <h2 className="text-5xl">えんぴつ</h2>
      <h3 className="text-5xl">enpitsu</h3>
    </main>
  )
}

// import { Suspense } from "react";

// import { HydrateClient, prefetch, trpc } from "~/trpc/server";
// import { AuthShowcase } from "./_components/auth-showcase";
// import {
//   CreatePostForm,
//   PostCardSkeleton,
//   PostList,
// } from "./_components/posts";

// export default function HomePage() {
//   prefetch(trpc.post.all.queryOptions());

//   return (
//     <HydrateClient>
//       <main className="container h-screen py-16">
//         <div className="flex flex-col items-center justify-center gap-4">
//           <h1 className="text-5xl font-extrabold tracking-tight sm:text-[5rem]">
//             Create <span className="text-primary">T3</span> Turbo
//           </h1>
//           <AuthShowcase />

//           <CreatePostForm />
//           <div className="w-full max-w-2xl overflow-y-scroll">
//             <Suspense
//               fallback={
//                 <div className="flex w-full flex-col gap-4">
//                   <PostCardSkeleton />
//                   <PostCardSkeleton />
//                   <PostCardSkeleton />
//                 </div>
//               }
//             >
//               <PostList />
//             </Suspense>
//           </div>
//         </div>
//       </main>
//     </HydrateClient>
//   );
// }
