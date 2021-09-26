---
tags: [functional-programming, typescript]
---

# Mastering sum types

This article describes the concept of a **sum type**, and the importance and power that it gives to your codebase. It's a thing from the [type theory](https://en.wikipedia.org/wiki/Type_theory) that is unrelated to a specific programming language. So, this article will be useful despite what language you use and who you are.

It also acts as an intro to functional programming, and in the latest section we'll show you specific examples of decoding unknown inputs in a TypeScript language with the help of `io-ts`.

<!-- truncate -->

## What is a sum type?

> In computer science, a **tagged union**, also called a variant, variant record, choice type, discriminated union, disjoint union, sum type or coproduct, is a data structure used to hold a value that could take on several different, but fixed, types. See [wiki](https://en.wikipedia.org/wiki/Tagged_union) for more information.

Super easy example in TypeScript to understand what we're talking about:

```ts
type Value = string | number

const a: Value = 'John'
const b: Value = 69
const c: Value = false // Won't compile
```

This is a minor example because the values themselves (`'John'`, `69`) act as "type discriminators", so we can easily pattern match them:

```ts
function program(a: Value) {
  if (typeof a === 'string') {
    // In this conditional block the type of `a` is `string`
    a.toUpperCase()
  } else {
    // In this conditional block the type of `a` is `number`
    a.toExponential()

    // Won't compile because there's no such property on the `number` type
    a.toUpperCase()
  }
}
```

## Why is it needed?

Algebraic data types (ADT's: sum and [product](https://en.wikipedia.org/wiki/Product_type)) enable you to make illegal states unrepresentable. While the type checking compiler allows for a programmer to move a program to a state that is illegal from the point of business logic, the program can't be considered as bug-free. To be absolutely sure that such a system works as expected, you must test it to its breaking point. So, one of the benefits of ADT's is to save you from unforseen bugs as well as to reduce the boilerplate code. In actuality, the whole point of type theory and statically typed languages is to catch as many errors as possible before the program is run.

> In simple words, a **product** type is a compound type (record or tuple). It's simply a plain object type in a TypeScript, an interface with only data fields in Java, a record in Haskell, a struct in C, etc. Tuples are also product types, the only difference is that they rely on order of fields instead of their names. In contrast to a sum type, a product type is an essential part of any general-purpose language.

It's a very common issue when dealing with an API response produced by a server written in an imperative language that won't allow consumers to unambiguously define the exact listing of possible fields. For example, let's say that a business analyst told you to implement the following business logic:

- There are two types of users: customers and merchants.
- Both customers and merchants have a phone number.
- Merchants will have three more fields: bank code, bank branch code and account number. All of them are required for a merchant.

The back-end team implemented it by adding two required and three optional fields, because it's easy to do so. The possible implementation in a typical imperative language can look like this:

```java
@Data
class User {
  @Required
  String userId;

  @Required
  String phoneNumber;

  String bankCode;

  String bankBranchCode;

  String accountNumber;
}
```

This implies that it's completely fine to create a customer or a merchant that has `userId`, `phoneNumber` and `bankCode`. The code allows you to do it, but a customer with the bank code or a merchant without the account number is a logic error. This obligates you to cover with test parts of your code that use the `User` class and make sure that in runtime it won't be permissible to construct an invalid instance. This can be achieved by building runtime validators for every method that uses instances of the `User` class - which isn't a pleasant experience.

Things may get worse if a potential logic error leaks out of your back-end subsystem. If the user entity defined above is going to be exposed through an HTTP API, the front-end developers have to define their response type as shown below because it's the only correct (though invalid) definition available.

```ts
type User = {
  userId: string
  phoneNumber: string
  bankCode?: string
  bankBranchCode?: string
  accountNumber?: string
}
```

This code is a car crash. It allows for the possibility of creating a value that type checks but is invalid. This leaves you with very little alternatives because the back-end should the only source of truth.

```ts
const user: User = {
  userId: '100',
  phoneNumber: '8 800 555 35 35',
  bankCode: undefined,
  bankBranchCode: undefined,
  accountNumber: 'II10101010TT',
}
```

What should the front-end developer do if he wants to display a different view depending on the user's type? At this point the only variation probably goes something like this:

```ts
function renderUser(user: UserResponse) {
  if (user.bankCode !== undefined) {
    // Here we must cheat to the compiler. This cheating can play tricks as seen below.
    renderMerchant(user as Merchant)
  } else {
    // Ok... Till the customer's entity doesn't have fields different from merchant's.
    renderCustomer(user as Customer)
  }
}

type Customer = {
  userId: string
  phoneNumber: string
}

function renderCustomer(customer: Customer) {}

type Merchant = {
  userId: string
  phoneNumber: string
  bankCode: string
  bankBranchCode: string
  accountNumber: string
}

function renderMerchant(merchant: Merchant) {
  // If there's a logic error on the server and the undefined accountNumber leaked to the client,
  // This line of code will throw an error. And the user will see a broken UI.
  // Users mustn't see broken UIs.
  renderString(merchant.accountNumber.slice(4))
}
```

Well, let's try to add more validation to make sure that the front-end code won't throw.

```ts
function renderUser(user: User) {
  if (
    user.bankCode !== undefined &&
    user.bankBranchCode !== undefined &&
    user.accountNumber !== undefined
  ) {
    renderMerchant(user as Merchant)
  } else {
    renderCustomer(user as Customer)
  }
}
```

Nice! Until the back-end adds a new field (or 50 new fields) to the merchant's entity. This code is unreliable anyway because it requires you to write **unnecessary** and **error-prone** lines of code instead of focusing on important features. Luckily, in the engineering world many have understood it for many years and created language concepts or patterns to make things safer. Let's take a look at an application of sum types for exactly the same business problem.

I won't bore you with how to properly define an API response using a sum type in an imperative language (I'll provide some examples in the next sections), but assuming that it's possible, let's focus on the response schema itself and a client-side part of the code. The primary point is to explicitly separate a customer's fields from a merchant's fields by using a product type (for common fields) and a sum type (for fields that differ).

```ts
type UserShared = {
  userId: string
  phoneNumber: string
}

type Customer = UserShared

type Merchant = UserShared & {
  bankCode: string
  bankBranchCode: string
  accountNumber: string
}

type User = Customer | Merchant
```

That's what we need. It's currently impossible to construct an invalid value - if you try, the compiler will disagree with you. So, let's try to implement a render function now.

```ts
function renderUser(user: User) {
  // Shit, now TypeScript doesn't know that user may or may
  // not have `bankCode` because it's defined only for the `Merchant` type.
  // The compiler doesn't type-check `user.bankCode`
  if (user.bankCode !== undefined) {
  }
}
```

Ok, let's explicitly say that customers don't have bank codes. Will it help the compiler to infer the type properly?

```ts
type Customer = UserShared & {
  bankCode: undefined
}

function renderUser(user: User) {
  // Now the compiler can type-check this field because
  // it's defined on both types of the union.
  if (user.bankCode !== undefined) {
    renderMerchant(user)
  } else {
    renderCustomer(user)
  }
}
```

The code now type-checks it, due to the introduction of a so-called "discriminant" - a single field that helps the compiler to distinguish between multiple types within a union. In our case `bankCode: string | undefined` is that field. If `bankCode` is defined, then the compiler can deduce that other fields (`bankBranchCode` and `accountNumber`) are defined as well

While possible to use a `T | undefined` type to distinguish one type from another, this approach won't work if a union consists of more than two types. In TypeScript, a discriminant can be a string literal, a number literal, a boolean - or any type with a fixed number of members.

```ts
type UserShared = {
  userId: string
  phoneNumber: string
}

type Customer = UserShared & {
  tag: 'Customer'
}

type Merchant = UserShared & {
  tag: 'Merchant'
  bankCode: string
  bankBranchCode: string
  accountNumber: string
}

type User = Customer | Merchant

function renderUser(user: User) {
  // No more `typeof`, now we refine the type based on a common discriminant
  // This mechanism is called "pattern matching"
  if (user.tag === 'Merchant') {
    renderMerchant(user)
  } else {
    renderCustomer(user)
  }
}
```

The type of the `tag` property of the `User` is `"Customer" | "Merchant"`. This is what's referred to as a "fixed number of members". If the back-end developers implement their API the way in which it returns a response of the `User` shape, front-end developers can rest easy knowing that their creation won't accidentally throw in runtime.

If you can understand what happened above, I congratulate you. If not, please read it once again. Now I'd like to share a quote from some clever man on Reddit:

> Sum types and exhaustive pattern matching aren't about expressiveness, they're tools for aiding code comprehension by increasing the locality of code that has no business being distributed into completely different classes, and decreasing the cost of making changes by heavily reducing the amount of test code that needs to be written to make sure a closed set of options is handled appropriately.

In other words:

- You can define a valid data definition in a single place (type, class, module, etc.) and other parts of the system won't bother themselves with a complex manual verification of its validity.
- You can reduce the number of validation tests because they have become unnecessary.

## How to define a sum type?

We already covered TypeScript, so let's find out how other languages are doing.

### Dynamic languages

Algebraic data types have no sense in scope of languages with dynamic typing like JavaScript, Python, PHP, Clojure, Ruby. There have been some attempts to add static typing to Python and PHP, but the resulting type systems are too poor to burden them with the type theory principles.

Using statically typed languages, you rely heavily on a compiler. In dynamically typed languages your friends are the documentation and unit tests. Being a strong fan of math, I don't derive pleasure from writing code using dynamic languages because without a proper coverage test I'll be unsure that my program will work as expected. This however, doesn't apply to languages from the Lisp family (Clojure, Common Lisp and others) because they have a completely different philosophy.

### Functional languages

It's trivial to define sum types in languages like Haskell, Scala, Rust, Swift, OCaml, F#, Kotlin because algebraic data types are the core concept of these languages by their design. The most expressive languages are Haskell, OCaml and F# - they offer the most laconic syntax of an ADT definition. In Scala sum types are described using case classes. In Kotlin - data classes. In Swift and Rust - enums. These are simply different names for a similar concept.

Here's an example of a couple of data types in Haskell:

```hs
-- This type has 3 constructors: Login, ConfirmRegistration, Refresh.
-- You can notice that unlike TypeScript, there's no such thing as `tag` - it's built into a constructor.
-- The pipe (|) is used to construct a sum, the record ({}) is used to construct a product.

data AuthType = Login { email :: String, password :: String }
              | ConfirmRegistration { password :: String }
              | Refresh { token :: String }

authType = Login "john.doe@email.com" "ilovestrawberryicecream"


-- This is a recursive definition.
-- A binary tree is either a leaf node or has at least one child binary tree.

data BinaryTree a = EmptyTree | Node a (BinaryTree a) (BinaryTree a)

tree = Node 10 (Node 20 EmptyTree EmptyTree) EmptyTree
```

Since ADT's are at the core level in the listed languages, we can get pattern matching for free.

```hs
-- This function applies a function `f` to every node in a given tree.
-- It uses pattern matching to split its implementation in two parts - one for a leaf and another for a node.

mapTree :: (a -> b) -> BinaryTree a -> BinaryTree b
mapTree f EmptyTree = EmptyTree
mapTree f (Node n1 n2) = Node (mapTree f n1) (mapTree f n2)

tree1 = Node 10 (Node 20 EmptyTree EmptyTree) EmptyTree

-- Node 11 (Node 21 EmptyTree EmptyTree) EmptyTree
tree2 = mapTree increment tree1
```

Let's compare it with the similar implementation in TypeScript.

```ts
type AuthType =
  | { tag: 'Login'; email: string; password: string }
  | { tag: 'ConfirmRegistration'; password: string }
  | { tag: 'Refresh'; token: string }
```

```ts
type BinaryTree<T> =
  | { tag: 'EmptyTree' }
  | { tag: 'Node'; value: T; left: BinaryTree<T>; right: BinaryTree<T> }

const mapTree = <A, B>(f: (a: A) => B) => {
  return (tree: BinaryTree<A>): BinaryTree<B> => {
    return tree.tag === 'EmptyTree'
      ? { tag: 'EmptyTree' }
      : {
          tag: 'Node',
          value: f(tree.value),
          left: mapTree(f)(tree.left),
          right: mapTree(f)(tree.right),
        }
  }
}

const tree1: BinaryTree<number> = {
  tag: 'Node',
  value: 10,
  left: {
    tag: 'Node',
    value: 20,
    left: { tag: 'EmptyTree' },
    right: { tag: 'EmptyTree' },
  },
  right: { tag: 'EmptyTree' },
}

const tree2 = mapTree<number, number>((x) => x + 1)(tree1)
```

If we omit the fact that it takes a lot of keystrokes to create an instance for a type and focus it on a `mapTree` function, we may notice that it's much more verbose in TypeScript than in Haskell. A more interesting fact is, that we can derive the `mapTree` function from the Haskell's data type definition:

```hs
data BinaryTree a = EmptyTree | Node a (BinaryTree a) (BinaryTree a) deriving (Functor)

tree1 = Node 10 (Node 20 EmptyTree EmptyTree) EmptyTree
tree2 = fmap increment tree1
```

A single line of code to rule them all. Either you are impressed or you're not, so let's move to the next section that is a bit depressing.

### Imperative languages

In imperative languages like Java, C#, C++, Go, PHP, Dart it's not easy to implement a sum type properly. Technically, it's possible, but it completely diverges from the OOP principles because these languages have much less in common than with type theory. This class has created a "Visitor" pattern that requires the creation of classes, interfaces, public static weird things and many lines of code. That's the reason why ADT's are rare animals in the OOP world.

You may think of three possible ways to implement some sort of sum type and a pattern matching. Below there's a list of options for Java. Please note that these things are very similar for other imperative languages.

- `instanceof` operator and manual type casting.
- A [Visitor pattern](https://blog.ploeh.dk/2018/06/25/visitor-as-a-sum-type/) that's mentioned above.
- Usage of a library like [dataenum](https://github.com/spotify/dataenum) or [ADT4J](https://github.com/sviperll/adt4j). Anyway they have [drawbacks](https://github.com/spotify/dataenum#known-weaknesses-of-dataenum) caused by the language limitations.

Using `instanceof` you have to manually search for each class that defines strategy according to runtime type, when in the "Visitor" the compiler forces you to implement new strategies everywhere.

It's worth mentioning that in Java 14 there's an improved pattern matching that can save you some keystrokes. See [details](https://www.baeldung.com/java-pattern-matching-instanceof#pattern-matching).

## Decoding sum types in runtime using io-ts (TypeScript)

In the previous sections we discussed how to define the response type of a user entity to match the requested business logic. One more important thing to discuss is a value decoding.

Because JSON is a valid JavaScript expression, many JavaScript programmers haven't bothered themselves to check the validity of values they receive from external sources. The most widely used and accepted sources of raw data are: user's input, web server response, web storage data. Big mistakes are made when we assume that the data came from these sources and can be used without any kind of validation.

The assumption is that writing an app in JavaScript won't be considered safe by default, as things worsen when TypeScript programs trust the external sources and propagate invalid values to deeper parts of your code while the compiler thinks that code is safe. A word of warning: It's not safe! You should always validate every piece of the data that you can't trust.

In the following examples provided below we'll show you how easily it is to fool the compiler and make TypeScript a useless or even harmful tool. We will intentionally omit all error handling.

```ts
type User = {
  userId: string
  phoneNumber: string
}

async function getUserFromAPI(): Promise<User> {
  const res = await fetch('/api/users/100')
  // The return type of `Response#json` method is `Promise<any>`. `any` is not what we want to work with.
  const user = await res.json()
  return user
}
```

```ts
function getUserFromStorage(): User {
  const json = localStorage.get('user_1')
  // The return type of `JSON.parse` method is `any`.
  const user = JSON.parse(json)
  return user
}
```

```ts
// The more specific example is related to the fact
// that `string` is not a valid type to represent a phone number.
function getUserFromInput(): void {
  const form = document.getElementbyId('form')
  const phoneNumber = form.elements['phoneNumber'].value

  fetch('/api/users', {
    method: 'POST',
    // An empty or ill-formatted string is not a valid phone number.
    body: JSON.stringify({ phoneNumber }),
  })
}
```

### Using io-ts to validate the input

Now we're going to fix it using [`io-ts`](https://github.com/gcanti/io-ts/blob/master/index.md) - a library that makes two things at once:

- Accepts an unknown input and makes sure that it matches the schema.
- Infers static types from the schema definition.

We have still omitted some important error handling in the examples below focusing solely on decoding the value.

```ts
import * as t from 'io-ts'
import { Either } from 'fp-ts/lib/Either'

const UserCodec = t.type({
  userId: t.string,
  phoneNumber: t.string,
})

type User = t.TypeOf<typeof UserCodec>

// Now the function returns a user entity only
// if the response matches the schema.
async function getUserFromAPI(): Promise<Either<t.Errors, User>> {
  const res = await fetch('/api/users/100')
  const json = await res.json()
  return UserCodec.decode(json)
}
```

```ts
// The same principle here. If a data in the localStorage is valid,
// the function will return the user entity.
function getUserFromStorage(): Either<t.Errors, User> {
  const json = localStorage.get('user_1')
  const data = JSON.parse(json)
  return UserCodec.decode(data)
}
```

```ts
// Here we will refine a phone number type
// use `unique symbol` here to ensure uniqueness across modules / packages
interface PhoneNumber {
  readonly PhoneNumber: unique symbol
}

const PhoneNumberCodec = t.brand(
  t.string,
  (x): x is Branded<string, PhoneNumber> => /\+380[0-9]{9}/.test(x),
  'PhoneNumber',
)

function getUserFromInput(): void {
  const form = document.getElementbyId('form')
  const phoneNumber = form.elements['phoneNumber'].value

  // We want to send a request only if the phone number
  // is a refined string that matches the PhoneNumberCodec.
  const result = PhoneNumberCodec.decode(phoneNumber)

  if (result._tag === 'Right') {
    fetch('/api/users', {
      method: 'POST',
      body: JSON.stringify({ phoneNumber: result.right }),
    })
  }
}
```

These use cases for data validation are the most commonly used, so please try to remember them.

### Either and Option types

You may notice that the output type of the `#decode` method is `Either<Errors, Something>`. It's cool, do you know why? Because `Either` is a sum type defined as `type Either<E, A> = Left<E> | Right<A>`. It has a `_tag` discriminant which allows you to pattern match on this type! It's worth mentioning that our production TypeScript apps are full of sum types like `Either` and `Option` (which is even simpler than `Either`).

The `Option` data type is defined as `type Option<A> = Some<A> | None`. Both of these types are generic and represent the following ideas:

- `Option` is used for data that may or may not exist. It's like `null`, but much more powerful with what you can do with it.
- `Either` is used for data that can have one of two distinct types. It found its usage in error handling where an error is usually put in the `Left` constructor and the actual value - in the `Right` constructor.

If you're just starting to learn functional programming, you should familiarize yourself more with these two types because they are the essence of every program written in a functional paradigm. Notice that in different languages they can be called differently. `Option` is sometimes referred to as `Maybe`, and `Either` as `Result`.

### Decoding sum type

Now let's see how we can decode the Customer/Merchant value coming from the server. We already know that the response type should be like the one below:

```ts
type UserShared = {
  userId: string
  phoneNumber: string
}

type Customer = UserShared & {
  tag: 'Customer'
}

type Merchant = UserShared & {
  tag: 'Merchant'
  bankCode: string
  bankBranchCode: string
  accountNumber: string
}

type User = Customer | Merchant
```

Fortunately, it should be super intuitive how to build a codec for it with the help of `io-ts` library. The type intersection (`&`) in TypeScript is achieved with the `intersection` function, and the type union (`|`) - with the `union` function.

```ts
import * as t from 'io-ts'

const UserSharedCodec = t.type({
  userId: t.string,
  phoneNumber: t.string,
})

const CustomerCodec = t.intersection([
  UserSharedCodec,
  t.type({
    tag: t.literal('Customer'),
  }),
])

const MerchantCodec = t.intersection([
  UserSharedCodec,
  t.type({
    tag: t.literal('Merchant'),
    bankCode: t.string,
    bankBranchCode: t.string,
    accountNumber: t.string,
  }),
])

const UserCodec = t.union([CustomerCodec, MerchantCodec])

// This type is identical to the type manually created above.
// But it's inferred for free as a bonus to the validation capability.
type User = t.TypeOf<typeof UserCodec>
```

And as a bonus I'll show you how we can write our React code in a completely type safe manner (with all error handling hidden in the library internals).

```tsx
import React from 'react'
import * as t from 'io-ts'
import { pipe } from 'fp-ts/lib/function'
import { get } from 'app/request'
import { decode } from '@axondev/request'
import { Query, useQuery } from '@axondev/request-hooks'
import { useStorageState } from '@axondev/use-storage-state'

// API call definition.
// Its return type is ReaderTaskEither<ResponseError, User>
// which is a composition of multiple abstractions.
const getUser = pipe(get('api/users/10'), decode(UserCodec))

// A component that queries the user from the server and shows it.
const UserView = () => {
  const $user = useQuery(getUser)

  return Query.render($user.state, (user) => {
    if (user.tag === 'Merchant') {
      return <div>{user.bankCode}</div>
    }
    return <div>{user.phoneNumber}</div>
  })
}

// A component that writes and reads user in the localStorage.
const UserManager = (props: { user: User }) => {
  const [user, setUser] = useStorageState({
    key: 'user',
    defaultValue: props.user,
    codec: UserCodec,
  })

  return (
    <div>
      {user.userId} - {user.phoneNumber}
      <button
        onClick={() => {
          setUser({ tag: 'Customer', userId: '10', phoneNumber: '12345' })
        }}
      />
    </div>
  )
}
```

## Summary

After reading this article you should be more familiar with algebraic data types and less apprehensive of functional programming. As we have shown, by following its principles you can be more productive in your daily coding routine. The general recommendations provided are:

- Build your programs in such a way that it's impossible to put the system into an illegal state or define a data object that's invalid from the point of business logic.
- Use ADT's in the API you create to make sure that its consumers can be productive too.
- Always validate inputs from external sources like server responses or web storage data. Servers in turn can validate request inputs and data requested from the database or other services.
