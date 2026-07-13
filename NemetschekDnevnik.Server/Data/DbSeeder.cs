using System;
using System.Collections.Generic;
using System.Linq;
using Bogus;
using BCrypt.Net;
using NemetschekDnevnik.Server.Models;

namespace NemetschekDnevnik.Server.Data
{
    public static class DbSeeder
    {
        private static readonly string[] BgFirstNames = { "Иван", "Димитър", "Георги", "Николай", "Петър", "Христо", "Стефан", "Мария", "Елена", "Йорданка", "Теодора", "Радослав", "Александър" };
        private static readonly string[] BgLastNames = { "Иванов", "Димитров", "Георгиев", "Николов", "Петров", "Тодоров", "Стоянов", "Ангелов", "Василев", "Попов" };
        private static readonly string[] HomeworkTitles = { "Упражнение 3", "Домашно за проекта", "Допълнителни задачи", "Тест подготовка" };
        private static readonly string[] HomeworkDescriptions = { 
            "Решете задачи от 1 до 5 на страница 42.", 
            "Довършете практическата задача в тетрадките.", 
            "Прочетете следващия разказ и извадете главните тези.",
            "Преговор на целия раздел за утре."
        };

        private static readonly Dictionary<string, string[]> SubjectTopics = new Dictionary<string, string[]>
        {
            { "Математика", new[] { "Квадратни уравнения", "Тригонометрия", "Вектори", "Прогресии" } },
            { "Български език и литература", new[] { "Части на речта", "Синтаксис", "Пунктуация", "Правопис" } },
            { "Информатика и ИТ", new[] { "Алгоритми и структури от данни", "Програмиране на C#", "Бази данни" } },
            { "Английски език", new[] { "Сегашно перфектно време", "Модални глаголи", "Есе на тема Околна среда" } },
            { "История и цивилизация", new[] { "Средновековна България", "Великата френска революция", "Първа световна война" } },
            { "Физика и астрономия", new[] { "Закони на Нютон", "Електромагнетизъм", "Квантова механика" } }
        };

        private static readonly string[] defaultTopics = { "Раздел 1", "Раздел 2", "Годишен преговор", "Входно ниво" };

        public static void SeedUsers(DnevnikContext context, Faker fakerEn)
        {
            var users = new List<User>();
            var random = new Random();

            Console.WriteLine("--> Започва генериране на данни in SeedUsers...");

            string fName = BgFirstNames[random.Next(BgFirstNames.Length)];
            string lName = BgLastNames[random.Next(BgLastNames.Length)];

            Console.WriteLine("--> Започва генериране на данни for Student Users...");

            // Seed Students
            for (int i = 0; i < 3; i++)
            {
                var studentUser = new User
                {
                    Email = fakerEn.Internet.Email(fName, lName, "dnevnik.bg").ToLower(),
                    FirstName = fName,
                    LastName = lName,
                    PhoneNumber = fakerEn.Phone.PhoneNumber("08########"),
                    PasswordHash = BCrypt.Net.BCrypt.HashPassword("Password123!"),
                    Role = "ученик",
                    IsApproved = true,
                    CreatedAt = DateTime.Now.AddMonths(-2)
                };
                users.Add(studentUser);
            }

            Console.WriteLine("--> Започва генериране на данни for Teacher Users...");

            // Seed Teachers
            for (int i = 0; i < 2; i++)
            {
                fName = BgFirstNames[random.Next(BgFirstNames.Length)];
                lName = BgLastNames[random.Next(BgLastNames.Length)];

                var teacherUser = new User
                {
                    Email = fakerEn.Internet.Email(fName, lName, "dnevnik.bg").ToLower(),
                    FirstName = fName,
                    LastName = lName,
                    PhoneNumber = fakerEn.Phone.PhoneNumber("08########"),
                    PasswordHash = BCrypt.Net.BCrypt.HashPassword("Password123!"),
                    Role = "учител",
                    IsApproved = true,
                    CreatedAt = DateTime.Now.AddMonths(-2)
                };
                users.Add(teacherUser);
            }

            Console.WriteLine("--> Започва генериране на данни for Admin Users...");

            // Seed Admins
            fName = BgFirstNames[random.Next(BgFirstNames.Length)];
            lName = BgLastNames[random.Next(BgLastNames.Length)];

            var adminUser = new User
            {
                Email = fakerEn.Internet.Email(fName, lName, "dnevnik.bg").ToLower(),
                FirstName = fName,
                LastName = lName,
                PhoneNumber = fakerEn.Phone.PhoneNumber("08########"),
                PasswordHash = BCrypt.Net.BCrypt.HashPassword("Password123!"),
                Role = "администратор",
                IsApproved = true,
                CreatedAt = DateTime.Now.AddMonths(-2)
            };
            users.Add(adminUser);

            Console.WriteLine("--> Започва генериране на данни for Parent Users...");

            // Seed Parents
            for (int i = 0; i < 2; i++)
            {
                fName = BgFirstNames[random.Next(BgFirstNames.Length)];
                lName = BgLastNames[random.Next(BgLastNames.Length)];

                var parentUser = new User
                {
                    Email = fakerEn.Internet.Email(fName, lName, "dnevnik.bg").ToLower(),
                    FirstName = fName,
                    LastName = lName,
                    PhoneNumber = fakerEn.Phone.PhoneNumber("08########"),
                    PasswordHash = BCrypt.Net.BCrypt.HashPassword("Password123!"),
                    Role = "родител",
                    IsApproved = true,
                    CreatedAt = DateTime.Now.AddMonths(-2)
                };
                users.Add(parentUser);
            }
            context.Users.AddRange(users);
            context.SaveChanges();
        }

        public static void SeedSubjects(DnevnikContext context)
        {
            Console.WriteLine("--> Започва генериране на данни for Subjects...");
            var subjectsList = new List<Subject>
            {
                new Subject { SubjectName = "Математика" },
                new Subject { SubjectName = "Български език и литература" },
                new Subject { SubjectName = "Информатика и ИТ" },
                new Subject { SubjectName = "Английски език" },
                new Subject { SubjectName = "История и цивилизация" },
                new Subject { SubjectName = "Физика и астрономия" }
            };
            context.Subjects.AddRange(subjectsList);
            context.SaveChanges();
        }
        public static void CreateStudents(DnevnikContext context)
        {
            var classesList = context.Classes.ToList();
            var students = context.Users.Where(u => u.Role == "ученик").ToList();
            var parents = context.Parents.ToList();

            var random = new Random();
            foreach (var userStudent in students)
            {
                var assignedClass = classesList[random.Next(classesList.Count)];
            
                var studentParent = parents[random.Next(parents.Count+1)];

                var studentProfile = new Student
                {
                    StudentId = userStudent.UserId,
                    ClassId = assignedClass.ClassId, 
                    ParentId = studentParent.ParentId
                };
                context.Students.Add(studentProfile);
            }
            context.SaveChanges();
        }

        public static void CreateTeachers(DnevnikContext context)
        {
            Console.WriteLine("--> Започва assignment на данни for Teacher table...");
            var teachers = context.Users.Where(u => u.Role == "учител").ToList();

            foreach (var teacher in teachers)
            {
                var teacherProfile = new Teacher
                {
                    TeacherId = teacher.UserId
                };

                context.Teachers.Add(teacherProfile);
            }
            context.SaveChanges();
        }

        public static void CreateAdmins(DnevnikContext context)
        {
            Console.WriteLine("--> Започва assignment на данни for Admin table...");
            var admins = context.Users.Where(u => u.Role == "администратор").ToList();

            foreach (var admin in admins)
            {
                var adminProfile = new Admin
                {
                    AdminId = admin.UserId 
                };

                context.Admins.Add(adminProfile);
            }
            context.SaveChanges();
        }

        public static void CreateParents(DnevnikContext context)
        {
            var parents = context.Users.Where(u => u.Role == "родител").ToList();
            
            foreach (var parent in parents)
            {
                var parentProfile = new Parent
                {
                    ParentId = parent.UserId 
                };
            
                context.Parents.Add(parentProfile);
            }
            context.SaveChanges();
        }

        public static void SeedClasses(DnevnikContext context)
        {
            Console.WriteLine("--> Започва генериране на данни for Classes...");

            var teachers = context.Teachers.ToList();

            var classesList = new List<Class>
            {
                new Class { ClassGrade = 10, ClassLetter = "А", HeadTeacherId = teachers[0].TeacherId },
                new Class { ClassGrade = 10, ClassLetter = "Б", HeadTeacherId = teachers[1].TeacherId },
            };
            context.Classes.AddRange(classesList);
            context.SaveChanges();
        }

        public static void SeedWeeklyShedule(DnevnikContext context)
        {
            Console.WriteLine("--> Започва генериране на данни for WeeklySchedule...");

            var classes = context.Classes.ToList();
            var subjects = context.Subjects.ToList();
            var teachers = context.Teachers.ToList();

            var random = new Random();

            foreach (var cls in classes)
            {
                for (int i = 0; i < 3; i++)
                {
                    var scheduleItem = new WeeklyScheduleItem
                    {
                        DayOfWeek = random.Next(1, 6), // 1 = Понеделник, 5 = Петък
                        SubjectId = subjects[random.Next(subjects.Count)].SubjectId,
                        TeacherId = teachers[random.Next(teachers.Count)].TeacherId,
                        Time = new TimeOnly(8 + i, 0),
                        ClassId = cls.ClassId,
                        Location = $"Стая {random.Next(100, 400)}"                     
                    };
                    context.WeeklyScheduleItems.Add(scheduleItem);
                }
            }

            context.SaveChanges();
            Console.WriteLine("--> Седмичната програма беше успешно сийдната!");
        }

        public static void SeedLessons(DnevnikContext context)
        {
            Console.WriteLine("--> Започва генериране на данни for Lessons...");

            var scheduleItems = context.WeeklyScheduleItems.ToList();

            foreach (var item in scheduleItems)
            {
                var lesson = new Lesson
                {
                    Date = DateOnly.FromDateTime(DateTime.Now), 
                    Time = item.Time,
                    SubjectId = item.SubjectId,
                    TeacherId = item.TeacherId,
                    ClassId = item.ClassId,
                    ScheduleItemId = item.ScheduleItemId 
                };

                context.Lessons.Add(lesson);
            }

            context.SaveChanges();
            Console.WriteLine("--> Уроците бяха успешно сийднати!");
        }

        public static void SeedHomework(DnevnikContext  context)
        {       
            var lessons = context.Lessons.ToList();
            var random = new Random();

            foreach (var lesson in lessons)
            {
                DateTime assignedDateTime = lesson.Date.ToDateTime(TimeOnly.MinValue);

                var homework = new HomeworkItem
                {
                    ClassId = lesson.ClassId,         
                    SubjectId = lesson.SubjectId,     
                    TeacherId = lesson.TeacherId,     
                    Title = HomeworkTitles[random.Next(HomeworkTitles.Length)],
                    Description = HomeworkDescriptions[random.Next(HomeworkDescriptions.Length)],
                    DateAssigned = assignedDateTime, 
                    DateDue = assignedDateTime.AddDays(3),
                    ResourceLink = null 
                };
                context.HomeworkItems.Add(homework);
            }
            context.SaveChanges();
            Console.WriteLine("--> Домашните задания бяха успешно сийднати!");
        }

        public static void SeedGradeTypes(DnevnikContext context)
        {
            var types = new List<GradeType>
            {
                new GradeType { TypeName = "Текуща" },
                new GradeType { TypeName = "Класна" },        
                new GradeType { TypeName = "Срочна" },      
                new GradeType { TypeName = "Годишна" },         
            };

            context.GradeTypes.AddRange(types);
            context.SaveChanges();
        }

        public static void SeedGrades(DnevnikContext context)
        {
            var students = context.Students.ToList();
            var subjects = context.Subjects.ToList();
            var teachers = context.Teachers.ToList();
            
            var gradeTypes = context.GradeTypes.ToList(); 
            var random = new Random();

            foreach (var student in students)
            {
                for (int i = 0; i < 3; i++)
                {
                    var subject = subjects[random.Next(subjects.Count)];
                    int numericValue = random.Next(2, 7); 
                    var matchedType = gradeTypes[numericValue - 2];

                    string[] topics = SubjectTopics.ContainsKey(subject.SubjectName) 
                        ? SubjectTopics[subject.SubjectName] 
                        : defaultTopics;

                    string randomTopic = topics[random.Next(topics.Length)];

                    string comment = matchedType.TypeName switch
                    {
                        "Тест" => $"Контролен тест върху: {randomTopic}",
                        "Класна работа" => $"Класна работа №{random.Next(1, 3)} - {randomTopic}",
                        "Проект" => $"Проектна задача на тема: \"{randomTopic}\"",
                        "Устно изпитване" => $"Устно изпитване върху: {randomTopic}",
                        _ => $"Текущо оценяване - {randomTopic}"
                    };

                    var grade = new Grade
                    {
                        StudentId = student.StudentId, 
                        SubjectId = subject.SubjectId, 
                        TeacherId = teachers[random.Next(teachers.Count)].TeacherId, 
                        GradeValue = numericValue, 
                        GradeTypeId = matchedType.GradeTypeId, 
                        Comment = comment, 
                        EntryDate = DateOnly.FromDateTime(DateTime.Now.AddDays(-random.Next(1, 14)))
                    };
                    context.Grades.Add(grade);
                }
            }
            context.SaveChanges();
        }   

        public static void SeedAllData(DnevnikContext context)
        {
            Console.WriteLine("--> СИйДЪРЪТ СТАРТИРА УСПЕШНО!");

            Console.WriteLine("--> Започва генериране на данни...");
                
            var fakerEn = new Faker("en");

            SeedUsers(context, fakerEn);

            SeedSubjects(context);

            CreateAdmins(context);

            CreateTeachers(context);

            SeedClasses(context);

            CreateParents(context); 

            CreateStudents(context); 

            SeedWeeklyShedule(context);   

            SeedLessons(context);            

            SeedHomework(context);

            SeedGradeTypes(context);

            SeedGrades(context);

            context.SaveChanges();
            Console.WriteLine("--> ВСИЧКИ ДАННИ БЯХА УСПЕШНО ЗАПИСАНИ В БАЗАТА ДАННИ!");
        }
    }
}